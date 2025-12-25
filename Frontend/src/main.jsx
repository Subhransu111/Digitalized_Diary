import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <Auth0Provider
    domain="dev-mns1lf8qbfytdl5b.us.auth0.com"
    clientId="d53cTKacd0JN6rwvIoQlTXUyOEMaTCeO"
    authorizationParams={{
      redirect_uri: window.location.origin,
      audience: "https://cyber-diary-api"
    }}
  >
    <StrictMode>
      <App />
    </StrictMode>
  </Auth0Provider>
)
