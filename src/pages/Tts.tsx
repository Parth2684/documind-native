import { Button } from '../components/ui/button';
import { store } from "../store/useStore";

export default function Tts() {
  const { text, setText, tts } = store();
  return (
    <>
      <input
        type="text"
        value={text}
        onChange={(e) => {
          setText(e.target.value)
        }}
      />

      <Button
        onClick={async () => {
          await tts()
          console.log("tts done")
        }}
      > Do TTS </Button>
    </>
  );
}
