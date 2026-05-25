import { Button } from '../components/ui/button';
import { store } from "../store/useStore";
import { Voices } from '../store/types';
import { useState } from 'react';

export default function Tts() {
  const { text, setText, tts } = store();
  const voices = Object.values(Voices).map(v => v)
  const [voice, setVoice] = useState<Voices>(Voices.af_heart)
  const [speed, setSpeed] = useState(1);
  return (
    <>
      <input
        type="text"
        value={text}
        onChange={(e) => {
          setText(e.target.value)
        }}
      />

      <label>Choose a voice</label>
      <select value={voice} onChange={(e) => setVoice(e.target.value as Voices)}>
        {voices.map((v) => (
          <option key={v} value={v} >{ v }</option>
        ))}
      </select>

      <input
        type="range"
        min="0.5"
        max="2"
        step="0.01"
        value={speed}
        onChange={(e) => setSpeed(Number(e.target.value))}
      />
      
      <p>{speed}x</p>

      
      <Button
        onClick={async () => {
          await tts(voice, speed)
          console.log("tts done")
        }}
      > Do TTS </Button>
    </>
  );
}
