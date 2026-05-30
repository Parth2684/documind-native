import { store } from '../store/useStore';
import { openUrl } from '@tauri-apps/plugin-opener'
import { Button } from '../components/ui/button'
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast/headless';
import { useNavigate } from 'react-router-dom';



export default function Keys() {
  const { keys, setKeys, addKey, deleteKey } = store();
  const nav = useNavigate();
  const [name, setName] = useState<string>()
  const [value, setValue] = useState<string>()
  useEffect(() => {
    setKeys()
  }, [])
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">API Keys</h1>
            <p className="text-muted-foreground">
              Manage your Gemini API keys for OCR and TTS features
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => nav("/home")}
          >
            Back to Home
          </Button>
        </div>

        {/* Add Key Section */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-card-foreground">Add New Key</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Add a Gemini API key to enable AI-powered features
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={async() => await openUrl("https://ai.google.dev/gemini-api/docs/api-key")}
              >
                Get API Key
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Key Name</label>
                <input
                  type='text'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder='e.g., My Project Key'
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">API Key</label>
                <input
                  type='text'
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder='Enter your Gemini API key'
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            <Button
              onClick={() => {
                if (name === undefined || value === undefined) {
                  toast.error("Add Name and value both")
                  return
                }
                addKey(name, value)
                setName(undefined)
                setValue(undefined)
              }}
              className="w-full md:w-auto"
              size="lg"
            >
              Add Key
            </Button>
          </div>
        </div>

        {/* Keys List */}
        {keys && keys.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Your Keys</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {keys.map(k => (
                <div
                  key={k.hash}
                  className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-medium text-card-foreground">{k.name}</h3>
                      <p className="text-xs text-muted-foreground font-mono">
                        {k.hash.slice(0, 8)}...{k.hash.slice(-4)}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteKey(k.hash)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {keys && keys.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto mb-4">
              <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.536 14.536m-1.414-1.414L6.343 6.343m8.485 8.485L7.757 17.757M12 12V3m0 9v9m-9-9h9m0 0h9" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No API Keys Yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
              Add your first Gemini API key to start using OCR and TTS features
            </p>
            <Button
              variant="outline"
              onClick={async() => await openUrl("https://ai.google.dev/gemini-api/docs/api-key")}
            >
              Learn How to Get an API Key
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}