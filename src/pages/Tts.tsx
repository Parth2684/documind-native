import { Button } from '../components/ui/button';
import { store } from "../store/useStore";
import { Voices } from '../store/types';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Tts() {
  const { text, setText, tts } = store();
  const nav = useNavigate();
  const voices = Object.values(Voices)
  const [voice, setVoice] = useState<Voices>(Voices.af_heart)
  const [speed, setSpeed] = useState(1);
  return (
    <div className="min-h-screen bg-linear-to-br from-background to-muted/20 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Text to Speech</h1>
            <p className="text-muted-foreground">
              Convert your text into natural-sounding speech
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => nav("/home")}
          >
            Back to Home
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Text Input */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-card-foreground mb-2">Text Input</h2>
                <p className="text-sm text-muted-foreground">
                  Enter the text you want to convert to speech
                </p>
              </div>
              <textarea
                value={text}
                onChange={(e) => {
                  setText(e.target.value)
                }}
                placeholder="Type or paste your text here..."
                className="flex min-h-50 w-full rounded-lg border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
            </div>
          </div>

          {/* Right Column - Controls */}
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
              <h2 className="text-lg font-semibold text-card-foreground">Voice Settings</h2>
              
              {/* Voice Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Voice</label>
                <select
                  value={voice}
                  onChange={(e) => setVoice(e.target.value as Voices)}
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {voices.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

              {/* Speed Control */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Speed</label>
                  <span className="text-sm font-mono text-primary">{speed.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.01"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="relative w-full ml-1 h-4 text-xs text-muted-foreground">
                  <span className="absolute left-0 -translate-x-1/2">0.5x</span>
                
                  {/* 1.0 is 33% between 0.5 and 2.0 */}
                  <span className="absolute left-[33%] -translate-x-1/2">
                    1.0x
                  </span>
                
                  <span className="absolute right-0 translate-x-1/2">2.0x</span>
                </div>              </div>

              {/* Generate Button */}
              <Button
                onClick={async () => {
                  await tts(voice, speed)
                  console.log("tts done")
                }}
                className="w-full"
                size="lg"
                disabled={!text}
              >
                Generate Speech
              </Button>
            </div>

            {/* Info Card */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                  <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-card-foreground">Tip</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    For best results, use clear text with proper punctuation. Adjust speed based on your preference.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
