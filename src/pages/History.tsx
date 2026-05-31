import { useEffect, useState } from 'react';
import { store } from '../store/useStore';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { openPath } from '@tauri-apps/plugin-opener';
import toast from 'react-hot-toast';
import { History as HistoryType } from '../store/types';


export default function History() {
  const { history, setHistory, deleteRecord, setText } = store()
  const nav = useNavigate()
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    audioId: string | null;
    audioPath: string | null;
  }>({ isOpen: false, audioId: null, audioPath: null });

  useEffect(() => {
    setHistory()
  }, [])

  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds.toFixed(2)}s`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(2);
    return `${mins}:${secs.toString().padStart(5, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getHistoryType = (h: HistoryType) => {
    if (h.audio && h.audio.length > 0) return 'both';
    return 'ocr';
  };

  const handleDelete = async (h: HistoryType) => {
    try {
      await deleteRecord(h.text.id, null, null);
      toast.success("Record deleted successfully");
      await setHistory();
    } catch (err) {
      console.error("Error deleting record: " + err);
      toast.error("Error deleting record");
    }
  };

  const handleDeleteAudio = async (audioId: string, audioPath: string, deleteFromFs: boolean) => {
    try {
      await deleteRecord(null, audioId, deleteFromFs ? audioPath : null);
      toast.success("Audio deleted successfully");
      await setHistory();
    } catch (err) {
      console.error("Error deleting audio: " + err);
      toast.error("Error deleting audio");
    }
  };

  const openDeleteDialog = (audioId: string, audioPath: string) => {
    setDeleteDialog({ isOpen: true, audioId, audioPath });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, audioId: null, audioPath: null });
  };

  const historyArray = Object.entries(history) as [string, HistoryType][];
  console.log(history)
  console.log(historyArray)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">History</h1>
            <p className="text-muted-foreground">
              View your OCR and TTS activity history
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

        {history.size === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto mb-4">
              <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No History Yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Your OCR and TTS activity will appear here once you start using the features
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              {historyArray.map((h) => {
                const type = getHistoryType(h[1]);

                return (
                  <div key={h[1].text.id} className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-4">

                    {/* Header row */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                          {type === 'ocr' && (
                            <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          )}
                          {type === 'both' && (
                            <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-card-foreground">
                            {type === 'ocr' && 'Text Extraction'}
                            {type === 'both' && 'OCR & TTS'}
                          </p>
                          <p className="text-xs text-muted-foreground">{formatDate(h[1].text.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Button
                          onClick={() => {
                            setText(h[1].text.text)
                            nav("/tts")
                          }}
                          className="w-full sm:w-auto"
                        >
                          Text To Speech
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(h[1])}
                          className="w-full sm:w-auto"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      </div>
                    </div>

                    {/* OCR Content - always present */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Extracted Text
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-sm text-foreground">
                          {h[1].text.text}
                        </p>
                      </div>
                    </div>

                    {/* Audio Content - array of audio files */}
                    {h[1].audio && h[1].audio.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.828-2.828" />
                          </svg>
                          Audio Files ({h[1].audio.length})
                        </div>
                        {h[1].audio.map((audio) => (
                          <div
                            key={audio.id}
                            className="bg-muted/50 rounded-lg p-3 space-y-2"
                          >
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                              <div
                                onClick={async () => {
                                  try {
                                    await openPath(audio.path)
                                  } catch (err) {
                                    console.error("Error opening file: " + err)
                                  }
                                }}
                                className="flex-1 cursor-pointer hover:bg-muted/30 rounded p-1 -m-1 transition-colors"
                              >
                                <p className="text-xs text-muted-foreground font-mono break-all">
                                  {audio.path}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 w-full sm:w-auto">
                                {audio.time && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground bg-background px-2 py-1 rounded">
                                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {formatTime(audio.time)}
                                  </div>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openDeleteDialog(audio.id, audio.path)}
                                  className="h-6 w-6 p-0"
                                >
                                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </Button>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(audio.created_at)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Delete Confirmation Dialog — outside the map, at root level */}
      {deleteDialog.isOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-xl border border-border shadow-lg max-w-md w-full p-6 space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Delete Audio File</h3>
              <p className="text-sm text-muted-foreground">
                Do you want to delete this audio file from the file system as well?
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Button
                variant="outline"
                onClick={closeDeleteDialog}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  handleDeleteAudio(deleteDialog.audioId!, deleteDialog.audioPath!, false);
                  closeDeleteDialog();
                }}
                className="w-full sm:w-auto"
              >
                Delete Record Only
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  handleDeleteAudio(deleteDialog.audioId!, deleteDialog.audioPath!, true);
                  closeDeleteDialog();
                }}
                className="w-full sm:w-auto"
              >
                Delete File & Record
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}