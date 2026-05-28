import { ChangeEvent, useEffect, useState } from 'react';
import { store } from '../store/useStore';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';


export default function Unlock() {
  const { setPasswordExistance, passwordExists, setAuth, authorized } = store()
  const nav = useNavigate();
  const [password, setPassword] = useState<string>("");
  const [initialPassword, setInitialPassword] = useState<string>("");
  const [finalPassword, setFinalPassword] = useState<string>("");
  useEffect(() => {
    setPasswordExistance();
  }, []);
  useEffect(() => {
    if (authorized) {
      nav("/home");
    }
  }, [authorized]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/\D/g, "").slice(0, 4);
      setPassword(val);
    };

  const initialHandleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/\D/g, "").slice(0, 4);
      setInitialPassword(val);
    };
  const finalHandleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/\D/g, "").slice(0, 4);
      setFinalPassword(val);
    };

  function submit (pass: string)  {
    setAuth(pass)
  }

  function setPasswordSubmit() {
    if (initialPassword === finalPassword) {
      setPassword(finalPassword)
      submit(finalPassword);
    }
  }
  if (passwordExists === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
          {/* Header */}
          <div className="text-center space-y-2 mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
              <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-card-foreground">
              {passwordExists ? "Welcome Back" : "Create PIN"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {passwordExists ? "Enter your 4-digit PIN to unlock" : "Set a 4-digit PIN to secure your account"}
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {passwordExists ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">PIN</label>
                  <input
                    type='password'
                    inputMode='numeric'
                    value={password}
                    onChange={handleChange}
                    placeholder='0000'
                    maxLength={4}
                    className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-center text-2xl tracking-[0.5em] font-medium placeholder:text-muted-foreground/50 placeholder:tracking-normal focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <Button
                  onClick={() => {
                    console.log("click")
                    submit(password)
                  }}
                  className="w-full"
                  size="lg"
                >
                  Unlock
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">New PIN</label>
                  <input
                    type='password'
                    inputMode='numeric'
                    value={initialPassword}
                    onChange={initialHandleChange}
                    placeholder='0000'
                    maxLength={4}
                    className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-center text-2xl tracking-[0.5em] font-medium placeholder:text-muted-foreground/50 placeholder:tracking-normal focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Confirm PIN</label>
                  <input
                    type='password'
                    inputMode='numeric'
                    value={finalPassword}
                    onChange={finalHandleChange}
                    placeholder='0000'
                    maxLength={4}
                    className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-center text-2xl tracking-[0.5em] font-medium placeholder:text-muted-foreground/50 placeholder:tracking-normal focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <Button
                  onClick={() => {
                    console.log("click")
                    setPasswordSubmit()
                  }}
                  className="w-full"
                  size="lg"
                >
                  Set PIN
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
  
}