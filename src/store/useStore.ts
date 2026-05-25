import { create } from 'zustand';
import { Action, Key, State, Voices } from './types';
import { invoke } from '@tauri-apps/api/core';
import toast from "react-hot-toast";


export const store = create<State & Action>((set, get) => ({
  passwordExists: null,
  authorized: false,
  text: "",
  keys: [],

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
    } catch (err) {
      console.error(("Error doing tts: " + err))
    }
    const end = performance.now();
    console.log(`Execution time: ${end - start} ms`);
  },

  setKeys: async () => {
    try {
      let keys = await invoke<Key[]>("get_meta");
      set({ keys })
    }
    catch (err) {
      console.error(("Error getting keys: " + err));
      toast.error("Error Getting Keys");
    }
  }
}));