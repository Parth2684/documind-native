import { store } from '../store/useStore';
import { openUrl } from '@tauri-apps/plugin-opener'
import { Button } from '../components/ui/button'
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast/headless';



export default function Keys() {
  const { keys, setKeys, addKey, deleteKey } = store();
  const [name, setName] = useState<string>()
  const [value, setValue] = useState<string>()
  useEffect(() => {
    setKeys()
  }, [])
  return <>
    <Button onClick={async() => await openUrl("https://ai.google.dev/gemini-api/docs/api-key")}>If You want to create a gemini key Click Here</Button>
    <label>Key Name</label>
    <input type='text' value={name} onChange={(e) => setName(e.target.value)} placeholder='Set any Unique name to your key (project id or )' />
    <input type='text' value={value} onChange={(e) => setValue(e.target.value)} placeholder='Enter A Valid Gemini Key' />
    <Button onClick={() => {
      if (name === undefined || value === undefined) {
        toast.error("Add Name and value both")
        return
      }      
      addKey(name, value)
    }}>Add Key</Button>

    {keys && <>
      {keys.map(k => (
        <div key={k.hash}>
          {k.name}
          <Button onClick={() => deleteKey(k.hash)}>Delete key</Button>
        </div>
      )) }
    </>}
  </>
}