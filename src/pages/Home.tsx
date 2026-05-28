import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';



export default function Home() {
  const nav = useNavigate()
  return (
    <div className="min-h-screen bg-linear-to-br from-background to-muted/20 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Documind
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform your documents with AI-powered tools. Extract text from images and PDFs, or convert text to natural speech.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* TTS Card */}
          <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50">
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.828-2.828" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-card-foreground">Text to Speech</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Convert your text into natural-sounding speech with multiple voice options and speed controls.
                </p>
              </div>
              <Button
                onClick={() => nav("/tts")}
                className="w-full"
                size="lg"
              >
                Get Started
              </Button>
            </div>
          </div>

          {/* OCR Card */}
          <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50">
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-card-foreground">PDF & Image to Text</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Extract text from PDFs and images using advanced OCR technology powered by Gemini AI.
                </p>
              </div>
              <Button
                onClick={() => nav("/ocr")}
                className="w-full"
                size="lg"
              >
                Get Started
              </Button>
            </div>
          </div>
          <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50">
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.828-2.828" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-card-foreground">Manage Keys</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Add or Delete Gemini Keys used for OCR
                </p>
              </div>
              <Button
                onClick={() => nav("/tts")}
                className="w-full"
                size="lg"
              >
                Get Started
              </Button>
            </div>
          </div>
          <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50">
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.828-2.828" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-card-foreground">History</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Check Your OCR and TTS History
                </p>
              </div>
              <Button
                onClick={() => nav("/tts")}
                className="w-full"
                size="lg"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}