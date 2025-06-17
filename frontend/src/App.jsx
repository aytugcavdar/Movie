import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home'
import Auth from './pages/Auth'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <ToastContainer position="top-right" />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </>
  )
}

export default App
