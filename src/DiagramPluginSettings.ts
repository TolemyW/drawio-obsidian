export enum SettingsTheme {
  full = "full",
  compact = "compact",
  sketch = "sketch",
}

type optionalBoolean = true | false | null;

export interface DiagramPluginSettings {
  welcomeComplete: boolean;
  theme: {
    dark: optionalBoolean;
    layout: SettingsTheme;
  };
  drawing: {
    sketch: optionalBoolean;
  };
  cssSnippets: string[];
  // Mirror of the drawio editor's in-iframe localStorage. Persists
  // shape-library toggles, recent colours, panel state, etc. across
  // sessions because the sandboxed iframe can't hold its own.
  editorLocalStorage: Record<string, string>;
}

export const DEFAULT_SETTINGS: DiagramPluginSettings = {
  welcomeComplete: false,
  theme: {
    dark: null,
    layout: SettingsTheme.sketch,
  },
  drawing: {
    sketch: true,
  },
  cssSnippets: [],
  editorLocalStorage: {},
};
