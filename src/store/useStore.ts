import { create } from 'zustand';
import { Action, History, Key, State, Voices } from './types';
import { invoke } from '@tauri-apps/api/core';
import toast from "react-hot-toast";


export const store = create<State & Action>((set, get) => ({
  passwordExists: null,
  authorized: false,
  text: "",
  keys: [],
  loading: false, 
  history: [],

  
  setPasswordExistance: async () => {
    try {
      const exists = await invoke<boolean>("check_vault");
      if (exists) {
        set({ passwordExists: true })
      } else {
        set({ passwordExists: false })
      }
    } catch (err) {
      console.error("Error determining if password exists: " + err);
      toast.error("Error determining vault existence")
    }
  },

  setAuth: async (password) => {
    set({ loading: true })
    try {
      const log = await invoke("unlock_vault", {
        password
      })
      console.log(("log " + log))
      console.log("unlock")
      set({ authorized: true });
      console.log("authorized: " + get().authorized)
    } catch (err) {
      console.error("Error Verifying if User is Valid: " + err);
      toast.error("Wrong Password");
    }
    set({ loading: false })
  },

  setText: (text) => {
    set({ text })
  },

  tts: async (voice: Voices, speed: number) => {
    const start = performance.now()
    let text = get().text;
    try {
      const path = await invoke<string>("tts", {
        text,
        voice,
        speed
      })

      console.log("tts saved at: " + path)
      toast.success("TTS Successfull");
    } catch (err) {
      console.error(("Error doing tts: " + err))
    }
    const end = performance.now();
    console.log(`Execution time: ${end - start} ms`);
  },

  setKeys: async () => {
    set({ loading: true })
    try {
      let keys = await invoke<Key[]>("get_meta");
      set({ keys })
    }
    catch (err) {
      console.error(("Error getting keys: " + err));
      toast.error("Error Getting Keys");
    }
    set({ loading: false })
  },

  ocr: async (hash, filePaths, category, model) => {
    set({ loading: true })
    try {
      let text = await invoke<string>("ocr" , {
        hash,
        filePaths,
        category,
        model
      })
      set({ text })
      toast.success("Extracting Text Successfull")
    } 
    
    catch (err) {
      console.error("Error doing ocr: " + err);
      toast.error("Error Extracting text")
    }
    set({ loading: false })
  },

  addKey: async (name, key) => {
    set({ loading: true });
    try {
      const addKey = await invoke<Key>("insert_keys", {
        name,
        key
      });
      set((state) => ({
        keys: [...state.keys, addKey]
      }))
    } catch (err) {
      console.error("Error adding key: " + err)
      toast.error("Key Could'nt be added try again")
    }
  },

  deleteKey: async (hash) => {
    set({ loading: true })
    try {
      await invoke("delete_key", {
        hash
      });
      let keys = [...get().keys];
      keys.filter((k) => k.hash === hash);
      set({ keys })
    } catch (err) {
      console.error("Error deleting key: " + err);
      toast.error("Error Deleteing key")
    }
  },

  setHistory: async() => {
    set({ loading: true })
    try {
      const history = await invoke<History[]>("history");
      history.forEach((h) => {
        h.created_at = new Date(h.created_at).toLocaleString();
        if (h.audio?.created_at) {
          h.audio.created_at = new Date(h.audio.created_at).toLocaleString()
        }
        if (h.text?.created_at) {
          h.text.created_at = new Date(h.text.created_at).toLocaleString()
        }
      })
      set({ history })
    } catch (err) {
      console.error("error getting history: " + err);
      toast.error("Error getting history")
    }
    set({ loading: false })
  },

  deleteRecord: async (ocr_id, tts_id, delete_from_fs) => {
    try {
      await invoke("delete_record", {
        ocr_id,
        tts_id,
        delete_from_fs
      })

      let history = get().history
      history.filter((h) => h.audio?.id === tts_id || h.text?.id === ocr_id);
      set({ history })
    } catch (err) {
      console.error("error deleting record: " + err);
      toast.error("Error deleting record")
    }
  }
}));