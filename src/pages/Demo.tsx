import { useEffect, useState } from "react";
import { readDir } from "@tauri-apps/plugin-fs";
import { resourceDir, join } from '@tauri-apps/api/path';
import { Button } from '../components/ui/button';
import { openPath } from '@tauri-apps/plugin-opener';


export default function Demo() {
  const [audios, setAudios] = useState<any[]>([]);
  const [audioPath, setAudioPath] = useState<string>()

  useEffect(() => {
    const load = async () => {
      const resourceDirPath = await resourceDir()
      const audioPath = await join(resourceDirPath, "voices")
      setAudioPath(audioPath)
      const files = await readDir(audioPath);
      files.sort((a, b) => a.name.localeCompare(b.name))
      setAudios(files);
    };

    load();
  }, []);


  return (
    <div>
      {audios.length > 0 ? (
        audios.map((file) => (
          <div key={file.name}>
            <Button onClick={() => openPath(`${audioPath}/${file.name}`)}>Play {file.name}</Button>
          </div>
        ))
      ) : (
        <p>No Sample Audios found</p>
      )}
    </div>
  );
}