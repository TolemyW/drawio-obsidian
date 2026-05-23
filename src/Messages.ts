export enum ActionMessageActions {
  Script = "script",
  Stylesheet = "stylesheet",
  Css = "css",
  FrameConfig = "frame-config",
  Load = "load",
  ToggleBodyClass = "toggle-body-class",
  LocalStorageSnapshot = "ls-snapshot",
}

export type FrameConfigActionMessage = {
  action: ActionMessageActions.FrameConfig;
  settings: any;
};

export type ScriptActionMessage = {
  action: ActionMessageActions.Script;
  script: string;
};

export type StylesheetActionMessage = {
  action: ActionMessageActions.Stylesheet;
  stylesheet: string;
};

export type CssActionMessage = {
  action: ActionMessageActions.Css;
  css: string;
};

export type ToggleBodyClassActionMessage = {
  action: ActionMessageActions.ToggleBodyClass;
  className: string;
  force: boolean;
};

export type DrawioLoadActionMessage = {
  action: ActionMessageActions.Load;
  xml: string;
};

export type LocalStorageSnapshotActionMessage = {
  action: ActionMessageActions.LocalStorageSnapshot;
  entries: Record<string, string>;
};

export type ActionMessage =
  | ScriptActionMessage
  | StylesheetActionMessage
  | CssActionMessage
  | ToggleBodyClassActionMessage
  | FrameConfigActionMessage
  | DrawioLoadActionMessage
  | LocalStorageSnapshotActionMessage;

export enum EventMessageEvents {
  Change = "change",
  Iframe = "iframe",
  Init = "init",
  Load = "load",
  FocusIn = "focusin",
  FocusOut = "focusout",
  LocalStorageChange = "ls-change",
}

export type FileChangeEventMessage = {
  event: EventMessageEvents.Change;
  data: string;
};

export type FrameEventMessage = {
  event: EventMessageEvents.Iframe;
};

export type FocusInEventMessage = {
  event: EventMessageEvents.FocusIn;
};

export type FocusOutEventMessage = {
  event: EventMessageEvents.FocusOut;
};

export type DrawioInitEventMessage = {
  event: EventMessageEvents.Init;
};

export type DrawioLoadEventMessage = {
  event: EventMessageEvents.Load;
  xml: string;
};

// key === null → clear() ; value === null → removeItem(key)
export type LocalStorageChangeEventMessage = {
  event: EventMessageEvents.LocalStorageChange;
  key: string | null;
  value: string | null;
};

export type EventMessage =
  | FrameEventMessage
  | FocusInEventMessage
  | FocusOutEventMessage
  | DrawioInitEventMessage
  | DrawioLoadEventMessage
  | FileChangeEventMessage
  | LocalStorageChangeEventMessage;

export type Message = ActionMessage | EventMessage;
