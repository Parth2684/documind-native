



export type State = {
  passwordExists: boolean | null;
  authorized: boolean;
  text: string
}

export type Action = {
  setPasswordExistance: () => Promise<void>;
  setAuth: (password: string) => Promise<void>;
  setText: (text: string) => void;
  tts: () => Promise<void>;
}