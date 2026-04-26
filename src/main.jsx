import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { HashRouter } from 'react-router-dom'
import { AuthProvider } from './context/useAuth.jsx'
createRoot(document.getElementById('root')).render(
    
    <HashRouter>
        <AuthProvider>
            <App />
        </AuthProvider>
    </HashRouter>
)
