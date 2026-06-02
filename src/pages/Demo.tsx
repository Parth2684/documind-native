import { useEffect, useState } from "react";
import { readDir } from "@tauri-apps/plugin-fs";
import { resourceDir, join } from '@tauri-apps/api/path';
import { Button } from '../components/ui/button';
import { openPath } from '@tauri-apps/plugin-opener';
import { useNavigate } from 'react-router-dom';


export default function Demo() {
  const [audios, setAudios] = useState<any[]>([]);
  const [audioPath, setAudioPath] = useState<string>()
  const nav = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        const resourceDirPath = await resourceDir()
        const audioPath = await join(resourceDirPath, "voices")
        setAudioPath(audioPath)
        const files = await readDir(audioPath);
        files.sort((a, b) => a.name.localeCompare(b.name))
        setAudios(files);
      } catch (err) {
        console.error("Error loading demo audios: " + err);
      }
    };

    load();
  }, []);

  const formatFileName = (name: string) => {
    return name.replace(/\.[^/.]+$/, ""); // Remove file extension
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background to-muted/20 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Demo Voices</h1>
            <p className="text-muted-foreground">
              Listen to sample audio files generated with different voices
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => nav("/home")}
            className="w-full sm:w-auto"
          >
            Back to Home
          </Button>
        </div>

        {/* Content */}
        {audios.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {audios.map((file) => (
              <div
                key={file.name}
                className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3 hover:shadow-md transition-shadow"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mx-auto">
                  <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.828-2.828" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-card-foreground text-center">
                    {formatFileName(file.name)}
                  </h3>
                  <Button
                    onClick={() => openPath(`${audioPath}/${file.name}`)}
                    className="w-full"
                    size="sm"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Play
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto mb-4">
              <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.828-2.828" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No Sample Audios</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              No demo audio files found in the voices directory
            </p>
          </div>
        )}
      </div>
    </div>
  );
}