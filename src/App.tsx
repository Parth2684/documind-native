import "./App.css";
import { Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Route } from 'react-router-dom';
import Unlock from './pages/Unlock';
import Home from './pages/Home';
import Tts from './pages/Tts';
import Ocr from './pages/Ocr';
import Keys from './pages/Keys';
import History from './pages/History';

function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<Unlock />} />
        <Route path='/home' element={<Home />} />
        <Route path='/tts' element={<Tts />} />
        <Route path='/ocr' element={<Ocr />} />
        <Route path='/edit-keys' element={<Keys />} />
        <Route path='/history' element={<History />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
