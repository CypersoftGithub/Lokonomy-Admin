import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { setupApiInterceptor } from './utils/apiInterceptor.js'

// Initialize global API fetch interceptor for auth error handling & header injection
setupApiInterceptor();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

