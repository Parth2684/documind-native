import { create } from "zustand";
import { Action, History, Key, State, Voices } from "./types";
import { invoke } from "@tauri-apps/api/core";
import toast from "react-hot-toast";

export const store = create<State & Action>((set, get) => ({
  passwordExists: null,
  authorized: false,
  text: "",
  keys: [],
  loading: false,
  history: new Map(),

  setPasswordExistance: async () => {
    try {
      const exists = await invoke<boolean>("check_vault");
      if (exists) {
        set({ passwordExists: true });
      } else {
        set({ passwordExists: false });
      }
    } catch (err) {
      console.error("Error determining if password exists: " + err);
      toast.error("Error determining vault existence");
    }
  },

  setAuth: async (password) => {
    set({ loading: true });
    try {
      const log = await invoke("unlock_vault", {
        password,
      });
      console.log("log " + log);
      console.log("unlock");
      set({ authorized: true });
      console.log("authorized: " + get().authorized);
    } catch (err) {
      console.error("Error Verifying if User is Valid: " + err);
      toast.error("Wrong Password");
    }
    set({ loading: false });
  },

  setText: (text) => {
    set({ text });
  },

  tts: async (voice: Voices, speed: number) => {
    const start = performance.now();
    let text = get().text;
    try {
      const path = await invoke<string>("tts", {
        text,
        voice,
        speed,
      });

      console.log("tts saved at: " + path);
      toast.success("TTS Successfull");
    } catch (err) {
      console.error("Error doing tts: " + err);
      toast.error("Error doing tts");
    }
    const end = performance.now();
    console.log(`Execution time: ${end - start} ms`);
  },

  setKeys: async () => {
    set({ loading: true });
    try {
      let keys = await invoke<Key[]>("get_meta");
      set({ keys });
    } catch (err) {
      console.error("Error getting keys: " + err);
      toast.error("Error Getting Keys");
    }
    set({ loading: false });
  },

  ocr: async (hash, filePaths, category, model) => {
    set({ loading: true });
    try {
      let text = await invoke<string>("ocr", {
        hash,
        filePaths,
        category,
        model,
      });
      set({ text });
      toast.success("Extracting Text Successfull");
    } catch (err) {
      console.error("Error doing ocr: " + err);
      toast.error("Error Extracting text");
    }
    set({ loading: false });
  },

  addKey: async (name, key) => {
    set({ loading: true });
    try {
      const addKey = await invoke<Key>("insert_keys", {
        name,
        key,
      });
      set((state) => ({
        keys: [...state.keys, addKey],
      }));
    } catch (err) {
      console.error("Error adding key: " + err);
      toast.error("Key Could'nt be added try again");
    }
  },

  deleteKey: async (hash) => {
    set({ loading: true });
    try {
      await invoke("delete_key", {
        hash,
      });
      const keys = get().keys.filter((k) => k.hash !== hash);
      set({ keys });
    } catch (err) {
      console.error("Error deleting key: " + err);
      toast.error("Error Deleteing key");
    }
  },

  setHistory: async () => {
    set({ loading: true });
    try {
      const historyObj = await invoke<Record<string, History>>("history");
      
      const history = new Map(Object.entries(historyObj));
      
      set({ history });
    } catch (err) {
      console.error("error getting history: " + err);
      toast.error("Error getting history");
    }
    set({ loading: false });
  },

  deleteRecord: async (
    ocr_id: string | null,
    tts_id: string | null,
    delete_from_fs: string | null,
  ) => {
    try {
      console.log({
        ocr_id,
        tts_id,
        delete_from_fs,
      });
      await invoke("delete_record", {
        ocrId: ocr_id,
        ttsId: tts_id,
        deleteFromFs: delete_from_fs,
      });


      if (tts_id) {
        console.log("history", get().history);
        console.log("is array: ", Array.isArray(get().history));
        console.log("is map: ", get().history instanceof Map);
        console.log("before", Array.from(get().history));
        let history = Array.from(get().history)
        history.forEach((his) => {
          his[1].audio = his[1].audio.filter((a) => a.id !== tts_id)
        });
        let historyMap = new Map(history);
        set({ history: historyMap })
        console.log("after", historyMap);      }
      if (ocr_id) {
        let history = new Map(get().history);
        history.delete(ocr_id);
        set({ history });
      }
    } catch (err) {
      console.error("delete_record failed", err);
      toast.error("Error deleting record");
    }
  },
}));
