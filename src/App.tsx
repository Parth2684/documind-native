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
import Demo from './pages/Demo';
import { store } from './store/useStore';

function App() {
  const { loading } = store();

  return (
    <>
      {loading && (
        <div className="fixed inset-0 bg-gray-500/90 flex items-center justify-center z-50">
          <div className="text-center space-y-4">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-white border-t-transparent mx-auto"></div>
            <p className="text-white text-lg font-medium">Loading...</p>
          </div>
        </div>
      )}
      <Routes>
        <Route path='/' element={<Unlock />} />
        <Route path='/home' element={<Home />} />
        <Route path='/tts' element={<Tts />} />
        <Route path='/ocr' element={<Ocr />} />
        <Route path='/edit-keys' element={<Keys />} />
        <Route path='/history' element={<History />} />
        <Route path='/demo' element={<Demo />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
