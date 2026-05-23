import { create } from 'zustand';
import { Action, State } from './types';
import { invoke } from '@tauri-apps/api/core';
import toast from "react-hot-toast";


export const store = create<State & Action>((set, get) => ({
  passwordExists: null,
  authorized: false,

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
      await invoke("unlock_vault", {
        password
      })
      set({ authorized: true });
    } catch (err) {
      console.error("Error Verifying if User is Valid: " + err);
      toast.error("Wrong Password");
    }
  }
}));