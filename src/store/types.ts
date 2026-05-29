export interface Key {
  hash: string;
  name: string;
}


export enum Category {
    Base = "Base",
    Notes = "Notes",
    Story = "Story",
    Music = "Music",
    Comic = "Comic",
    Coding = "Coding",
    Presentation = "Presentation",
}

export interface History {
  created_at: string;
  text: {
    id: string;
    text: string;
    created_at: string;
  } | null,
  audio: {
    id: string;
    path: string;
    created_at: string;
    time: number;
    ocr_id: string | null
  } | null
}


export enum Model {
  ThreeFiveFlash = "gemini-3.5-flash",
  ThreeFlashPreview = "gemini-3-flash-preview",
  ThreeOneFlashLite = "gemini-3.1-flash-lite",
  TwoFiveFlash = "gemini-2.5-flash",
  TwoFiveFlashLite = "gemini-2.5-flash-lite" ,
}


export enum Voices {
  af_heart = "af_heart",
  af_alloy = "af_alloy",
  af_aoede = "af_aoede",
  af_bella = "af_bella",
  af_jessica = "af_jessica",
  af_kore = "af_kore",
  af_nicole = "af_nicole",
  af_nova = "af_nova",
  af_river = "af_river",
  af_sarah = "af_sarah",
  af_sky = "af_sky",
  am_adam = "am_adam",
  am_echo = "am_echo",
  am_eric = "am_eric",
  am_fenrir = "am_fenrir",
  am_liam = "am_liam",
  am_michael = "am_michael",
  am_onyx = "am_onyx",
  am_puck = "am_puck",
  bf_alice = "bf_alice",
  bf_emma = "bf_emma",
  bf_isabella = "bf_isabella",
  bf_lily = "bf_lily",
  bm_daniel = "bm_daniel",
  bm_fable = "bm_fable",
  bm_george = "bm_george",
  bm_lewis = "bm_lewis",
}

export type State = {
  passwordExists: boolean | null;
  authorized: boolean;
  text: string;
  keys: Key[];
  loading: boolean;
  history: History[]
};

export type Action = {
  setPasswordExistance: () => Promise<void>;
  setAuth: (password: string) => Promise<void>;
  setText: (text: string) => void;
  tts: (voice: Voices, speed: number) => Promise<void>;
  setKeys: () => Promise<void>;
  ocr: (hash: string, file_paths: Map<number, string>, category: Category, model: Model) => Promise<void>
  addKey: (name: string, key: string) => Promise<void>
  deleteKey: (hash: string) => Promise<void>;
  setHistory: () => Promise<void>
};
