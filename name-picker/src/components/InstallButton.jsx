
import { useEffect, useState } from 'react'
import { Download, CheckCircle2 } from 'lucide-react'

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
    if (installPrompt) {
      await installPrompt.prompt()
      await installPrompt.userChoice
      setInstallPrompt(null)
      return
    }

    alert(
      'Para instalar, abra o menu do navegador e procure a opção "Instalar aplicativo" ou "Adicionar à tela inicial".',
    )
  }

  if (installed) {
    return (
      <>
      </>
    )
  }

  return (
    <button
      type="button"
      onClick={handleInstall}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2.5 text-sm font-semibold text-amber-200 transition hover:bg-amber-400/20"
    >
      <Download size={16} aria-hidden="true" />
      Instalar aplicativo
    </button>
  )
}
