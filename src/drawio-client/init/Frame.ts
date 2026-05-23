import {
  ActionMessage,
  ActionMessageActions,
  EventMessageEvents,
  FrameConfigActionMessage,
  LocalStorageSnapshotActionMessage,
} from "../../Messages";
import { FrameMessenger } from "../../FrameMessenger";
import { loadScript } from "./RequestManager";
import { ConfigurationManager } from "./ConfigurationManager";

export class Frame {
  window: Window;
  frameMessenger: FrameMessenger;
  urlParams: Object;
  configurationManager: ConfigurationManager;

  public static main(
    window: Window,
    configurationManager: ConfigurationManager
  ) {
    return new Frame(window, configurationManager);
  }

  private constructor(
    window: Window,
    configurationManager: ConfigurationManager
  ) {
    this.window = window;
    this.frameMessenger = new FrameMessenger(
      () => this.window.parent,
      this.handleMessages.bind(this)
    );
    this.configurationManager = configurationManager;

    // Stub out the cookie that drawio tries to read - this would throw an error because
    // cookies aren't available in the page loaded from a data: url
    Object.defineProperty(document, "cookie", { value: "" });

    // Don't make requests for resources, use inline defaults.
    Object.defineProperty(window, "mxLoadResources", { value: false });

    // Set the script loading function in the global scope
    Object.defineProperty(window, "mxscript", {
      value: loadScript,
    });

    // Bridge localStorage to the plugin so editor preferences (enabled
    // shape libraries, recent colours, format panel state, etc.) persist
    // across sessions. The iframe is sandboxed under a data: URL so the
    // native localStorage either throws or is wiped each load; we back
    // it with an in-memory Map that gets primed from a snapshot
    // delivered by the host before drawio.js runs, and we relay every
    // mutation back out as a ls-change event.
    Object.defineProperty(window, "isLocalStorage", { value: true });

    const lsStore: Map<string, string> = new Map();
    const sendLsChange = (key: string | null, value: string | null) => {
      this.frameMessenger.sendMessage({
        event: EventMessageEvents.LocalStorageChange,
        key,
        value,
      });
    };
    const bridgedStorage = {
      getItem(key: string): string | null {
        const v = lsStore.get(String(key));
        return v === undefined ? null : v;
      },
      setItem(key: string, value: any) {
        const k = String(key);
        const v = String(value);
        if (lsStore.get(k) === v) return;
        lsStore.set(k, v);
        sendLsChange(k, v);
      },
      removeItem(key: string) {
        const k = String(key);
        if (!lsStore.has(k)) return;
        lsStore.delete(k);
        sendLsChange(k, null);
      },
      clear() {
        if (lsStore.size === 0) return;
        lsStore.clear();
        sendLsChange(null, null);
      },
      key(i: number): string | null {
        return Array.from(lsStore.keys())[i] ?? null;
      },
      get length() {
        return lsStore.size;
      },
    };
    Object.defineProperty(window, "localStorage", { value: bridgedStorage });
    (this as any).lsStore = lsStore;

    window.addEventListener("focus", () => {
      this.frameMessenger.sendMessage({
        event: EventMessageEvents.FocusIn,
      });
    });

    window.addEventListener("blur", () => {
      this.frameMessenger.sendMessage({
        event: EventMessageEvents.FocusOut,
      });
    });
  }

  public addScript(scriptSource: string) {
    const scriptElement = document.createElement("script");
    scriptElement.text = scriptSource;
    document.head.appendChild(scriptElement);
  }

  addCss(cssSource: string) {
    const styleElement = document.createElement("style");
    styleElement.textContent = cssSource;
    document.head.appendChild(styleElement);
  }

  addStylesheet(href: string) {
    const linkElement = document.createElement("link");
    linkElement.rel = "stylesheet";
    linkElement.href = href;
    document.head.appendChild(linkElement);
  }

  toggleBodyClassName(className: string, force: boolean) {
    document.body.classList.toggle(className, force);
  }

  handleFrameConfigMessage(message: FrameConfigActionMessage) {
    const settings = message.settings;
    this.configurationManager.setConfig(settings);
  }

  handleLocalStorageSnapshotMessage(
    message: LocalStorageSnapshotActionMessage
  ) {
    const store: Map<string, string> = (this as any).lsStore;
    if (!store) return;
    store.clear();
    const entries = message.entries || {};
    for (const k of Object.keys(entries)) {
      store.set(k, String(entries[k]));
    }
  }

  handleMessages(message: ActionMessage) {
    if ("action" in message) {
      switch (message.action) {
        case ActionMessageActions.Script:
          this.addScript(message.script);
          break;
        case ActionMessageActions.Stylesheet:
          this.addStylesheet(message.stylesheet);
          break;
        case ActionMessageActions.Css:
          this.addCss(message.css);
          break;
        case ActionMessageActions.ToggleBodyClass:
          this.toggleBodyClassName(message.className, message.force);
          break;
        case ActionMessageActions.FrameConfig:
          this.handleFrameConfigMessage(message);
          break;
        case ActionMessageActions.LocalStorageSnapshot:
          this.handleLocalStorageSnapshotMessage(message);
          break;
      }
    }
  }
}
