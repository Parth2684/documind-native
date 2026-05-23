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
    return <div>Loading...</div>;
  }
  return <>
    { passwordExists ?
      <>
      <input
        type='password'
        inputMode='numeric'
        value={password}
        onChange={handleChange}
        placeholder='0000'
      ></input>
        <Button onClick={
          () => {
            console.log("click")
            submit(password)
          }
        }>Submit</Button>
      </>
      
      :
      <>
        <input
          type='number'
          inputMode='numeric'
          value={initialPassword}
          onChange={initialHandleChange}
          placeholder='0000'></input>
        <input
          type='number'
          inputMode='numeric'
          value={finalPassword}
          onChange={finalHandleChange}
          placeholder='0000'></input>

        <button onClick={() => {
          console.log("click")
          setPasswordSubmit()
        }}>submit</button>
      </>
    }
  </>
  
}