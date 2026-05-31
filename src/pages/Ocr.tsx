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
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Processing files...</p>
        </div>
      </div>
    )
  }
  if (keys.length === 0) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background to-muted/20 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="rounded-xl border border-border bg-card p-8 shadow-sm text-center space-y-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto">
              <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.536 14.536m-1.414-1.414L6.343 6.343m8.485 8.485L7.757 17.757M12 12V3m0 9v9m-9-9h9m0 0h9" />
              </svg>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-card-foreground">No API Keys Found</h2>
              <p className="text-sm text-muted-foreground">
                Add a Gemini API key to use the OCR feature
              </p>
            </div>
            <Button
              onClick={() => nav("/edit-keys")}
              size="lg"
              className="w-full"
            >
              Add API Key
            </Button>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">PDF & Image to Text</h1>
            <p className="text-muted-foreground">
              Extract text from your documents using AI-powered OCR
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

        {/* Main Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - File Selection & Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* File Selection */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-card-foreground mb-2">Select Files</h2>
                  <p className="text-sm text-muted-foreground">
                    Choose PDF or image files to extract text from
                  </p>
                </div>
                
                <div
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={async () => await selectFiles()}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mx-auto mb-4">
                    <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Click to select files
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDFs and images supported
                  </p>
                </div>

                {files.size > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Selected Files:</p>
                    <div className="space-y-1">
                      {Array.from(files.entries()).map(([index, path]) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded px-3 py-2"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="truncate">{path}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Configuration */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
              <h2 className="text-lg font-semibold text-card-foreground">Configuration</h2>
              
              <div className="space-y-4">
                {/* API Key Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">API Key</label>
                  <select
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select a key</option>
                    {keys.map((k) => (
                      <option key={k.hash} value={k.hash}>{k.name}</option>
                    ))}
                  </select>
                </div>

                {/* Category Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">OCR Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Model Selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">Gemini Model</label>
                    <a
                      href='https://aistudio.google.com/rate-limit?timeRange=last-28-days'
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      Check usage & availability
                    </a>
                  </div>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value as Model)}
                    className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {models.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <Button
                onClick={() => {
                  if (key === undefined) {
                    toast.error("Please choose a key")
                    return
                  }
                  ocr(key, files, category, model)
                }}
                className="w-full"
                size="lg"
                disabled={files.size === 0}
              >
                Extract Text
              </Button>
            </div>
          </div>

          {/* Right Column - Results */}
          {text && (
            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                <h2 className="text-lg font-semibold text-card-foreground">Extracted Text</h2>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="flex min-h-75 w-full rounded-lg border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  placeholder="Extracted text will appear here..."
                />
                <Button
                  onClick={() => nav("/tts")}
                  className="w-full"
                  size="lg"
                >
                  Convert to Speech
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}