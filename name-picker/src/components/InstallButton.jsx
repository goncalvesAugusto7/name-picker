
import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'

export default function InstallButton() {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true

    setInstalled(standalone)

    function handleBeforeInstall(event) {
      event.preventDefault()
      setInstallPrompt(event)
    }

    function handleInstalled() {
      setInstalled(true)
      setInstallPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  async function handleInstall() {
    if (!installPrompt) return

    await installPrompt.prompt()
    const result = await installPrompt.userChoice

    if (result.outcome === 'accepted') {
      setInstallPrompt(null)
    } else {
      setInstallPrompt(null)
    }
  }

  if (installed || !installPrompt) return null

  return (
    <button
      type="button"
      onClick={handleInstall}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2.5 text-sm font-semibold text-amber-200 transition hover:bg-amber-400/20"
    >
      <Download className="size-4" />
      Instalar aplicativo
    </button>
  )
}
