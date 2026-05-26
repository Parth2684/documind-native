import { create } from 'zustand';
import { Action, Key, State, Voices } from './types';
import { invoke } from '@tauri-apps/api/core';
import toast from "react-hot-toast";


export const store = create<State & Action>((set, get) => ({
  passwordExists: null,
  authorized: false,
  text: "",
  keys: [],
  loading: false, 

  
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

  ocr: async (hash, file_paths, category, model) => {
    set({ loading: true })
    try {
      let text = await invoke<string>("ocr" , {
        hash,
        file_paths,
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
  }
}));