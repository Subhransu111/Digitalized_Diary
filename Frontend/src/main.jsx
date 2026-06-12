import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import './index.css'
import App from './App.jsx'

const handleAuthRedirect = (appState) => {
  const returnTo = appState?.returnTo || '/dashboard'
  const targetPath = returnTo.startsWith('/') ? returnTo : '/dashboard'

  window.history.replaceState({}, document.title, targetPath)
}

createRoot(document.getElementById('root')).render(
  <Auth0Provider
    domain="dev-mns1lf8qbfytdl5b.us.auth0.com"
    clientId="d53cTKacd0JN6rwvIoQlTXUyOEMaTCeO"
    onRedirectCallback={handleAuthRedirect}
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
