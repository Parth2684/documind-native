import { useEffect, useState } from 'react';
import { store } from '../store/useStore';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { open } from '@tauri-apps/plugin-dialog';
import toast from 'react-hot-toast';
import { Category, Model } from '../store/types';



export default function Ocr() {
  const { keys, setKeys, loading, ocr, text, setText } = store()
  const nav = useNavigate();
  const [files, setFiles] = useState(new Map<number, string>())
  const [key, setKey] = useState<string>();
  const [category, setCategory] = useState<Category>(Category.Base);
  const [model, setModel] = useState<Model>(Model.ThreeFiveFlash);
  
  useEffect(() => {
    setKeys()
  }, [])

  const categories = Object.values(Category);
  const models = Object.values(Model);
  async function selectFiles() {
    try {
      const selectedFiles = await open({
        directory: false,
        multiple: true
      })

      if (selectedFiles === null || selectedFiles.length === 0) {
        return
      }
      let map = new Map();
      for (let i = 1; i <= selectedFiles.length; i++) {
        map.set(i, selectedFiles[i-1])
      }
      
      setFiles(map);
    } catch (err) {
      console.error("Error selecting file: " + err);
      toast.error("Error Selecting files");
    }
  }

  if (loading) {
    return <>
      loading...
    </>
  }
  if (keys.length === 0) {
    return <div>
      <Button onClick={() => nav("/edit-keys")}>Please add a Gemini Key To use this feature</Button>
    </div>
  }
  return <div>
    <Button onClick={() => nav("/edit-keys")}>Edit Keys</Button>
    <Button onClick={async () => {
      await selectFiles();
    }}>Select Files (Only Pdfs or Images are Valid)</Button>
    <label>Please select a gemini key</label>
    <select value={key} onChange={(e) => setKey(e.target.value)}>
      {/*<option value="">Select key</option>*/}
    {
      keys.map((k) => (
        <option key={k.hash} value={k.hash}> { k.name }</option>
      ))
    }
    </select>

    <label>Select Category Of Ocr</label>
    <select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
      {
        categories.map((c) => (
          <option key={c} value={c} >{ c }</option>
        ))
      }
    </select>

    <label>Select Which Gemini Model You Want To Use</label>
    <a href='https://aistudio.google.com/rate-limit?timeRange=last-28-days'>Click here to check Usage And Availablility of your gemini models</a>
    <select value={model} onChange={(e) => setModel(e.target.value as Model)}>
      {
        models.map((m) => (
          <option key={m} value={m}> { m } </option>
        ))
      }
    </select>
    <Button onClick={() => {
      if (key === undefined) {
        toast.error("Please choose a key")
        return
      }
      ocr(key, files, category, model)
    }
    }>Extract Text</Button>

    {text &&<> <input value={text} type='text' onChange={(e) => setText(e.target.value)} />
      <Button onClick={() => nav("/tts")}>Convert to Speech</Button>
    </>
    }
  </div>
}