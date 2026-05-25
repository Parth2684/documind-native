import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';



export default function Home() {
  const nav = useNavigate()
  return <>
    <Button
      onClick={() => nav("/tts")}
    >
      Text To Speech
    </Button>
    <Button
      onClick={() => nav("/ocr")}
    >
      Pdf | Image to Text
    </Button>
  </>
}