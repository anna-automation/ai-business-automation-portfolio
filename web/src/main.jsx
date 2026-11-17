import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { PrefsProvider } from './lib/prefs.jsx'
import { ToastProvider } from './lib/toast.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PrefsProvider>
      <ToastProvider>
        <BrowserRouter
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <App />
        </BrowserRouter>
      </ToastProvider>
    </PrefsProvider>
  </StrictMode>
)
