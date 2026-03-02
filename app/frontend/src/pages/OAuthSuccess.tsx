import { useEffect } from 'react'

export function OAuthSuccess() {
  useEffect(() => {
    // Notify opener window and close if possible
    try {
      window.opener?.postMessage({ type: 'oauth-success' }, window.location.origin)
      // Give the opener a moment to receive the message, then close.
      setTimeout(() => window.close(), 500)
    } catch (e) {
      console.warn('Could not postMessage to opener', e)
    }
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="p-6 bg-white rounded shadow">
        <p>Connection successful. You can close this window.</p>
      </div>
    </div>
  )
}

export default OAuthSuccess