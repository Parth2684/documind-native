



export type State = {
  passwordExists: boolean | null;
  authorized: boolean;
}

export type Action = {
  setPasswordExistance: () => Promise<void>;
  setAuth: (password: string) => Promise<void>;
}