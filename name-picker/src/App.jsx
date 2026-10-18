
import { useCallback, useEffect, useRef, useState } from 'react'
import InstallButton from './components/InstallButton'
import {
  UsersRound,
  Plus,
  Trash2,
  Shuffle,
  RotateCcw,
  Volume2,
  Trophy,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Users,
} from 'lucide-react'

export default function App() {
  const [namesText, setNamesText] = useState('')
  const [newName, setNewName] = useState('')

  const [selectedName, setSelectedName] = useState('')
  const [drawnNames, setDrawnNames] = useState([])
  const [drawMode, setDrawMode] = useState('random')
  const [message, setMessage] = useState(
    'Adicione os participantes para começar o sorteio.',
  )

  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isRevealing, setIsRevealing] = useState(false)
  const [isDrawModalOpen, setIsDrawModalOpen] = useState(false)

  const [ttsReady, setTtsReady] = useState(false)
  const [ttsStatus, setTtsStatus] = useState('Preparando narração...')
  const [ttsProgress, setTtsProgress] = useState(0)

  const [groups, setGroups] = useState([])
  const [isGroupsModalOpen, setIsGroupsModalOpen] = useState(false)

  const ttsRef = useRef(null)
  const audioRef = useRef(null)
  const audioUrlRef = useRef(null)
  const sequenceRef = useRef(0)

  const names = namesText
    .split('\n')
    .map((name) => name.trim())
    .filter(Boolean)

  const uniqueNames = [...new Set(names)]

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }

    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current)
      audioUrlRef.current = null
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadVoice() {
      try {
        setTtsStatus('Carregando modelo de voz...')
        setTtsProgress(0)

        const { Piper } = await import('@pedrobef/vozz/piper')

        const tts = await Piper.carregar({
          aoProgredir: (progress) => {
            if (cancelled) return

            const value =
              typeof progress === 'number'
                ? progress
                : Number(progress?.progresso ?? progress?.progress ?? 0)

            setTtsProgress(Math.min(100, Math.max(0, value)))
          },
        })

        if (cancelled) return

        ttsRef.current = tts
        setTtsReady(true)
        setTtsProgress(100)
        setTtsStatus('Narração pronta')
      } catch (error) {
        console.error('Erro ao carregar a voz:', error)

        if (cancelled) return

        setTtsReady(false)
        setTtsStatus('Narração indisponível')
      }
    }

    loadVoice()

    return () => {
      cancelled = true
      sequenceRef.current += 1
      stopAudio()
    }
  }, [stopAudio])

  const playSound = useCallback(
    (path) =>
      new Promise((resolve) => {
        stopAudio()

        const audio = new Audio(path)
        audioRef.current = audio

        const finish = () => {
          if (audioRef.current === audio) {
            audioRef.current = null
          }

          resolve()
        }

        audio.addEventListener('ended', finish, { once: true })
        audio.addEventListener('error', finish, { once: true })

        audio.play().catch(() => finish())
      }),
    [stopAudio],
  )

  const playVoice = useCallback(
    async (name) => {
      if (!ttsRef.current) return false

      try {
        const generatedAudio = await ttsRef.current.falar(
          `${name}.`,
          { velocidade: 0.7 },
        )

        const blob = generatedAudio.paraBlob()
        const url = URL.createObjectURL(blob)

        stopAudio()

        const audio = new Audio(url)
        audioRef.current = audio
        audioUrlRef.current = url

        await new Promise((resolve) => {
          const finish = () => resolve()

          audio.addEventListener('ended', finish, { once: true })
          audio.addEventListener('error', finish, { once: true })

          audio.play().catch(finish)
        })

        if (audioRef.current === audio) {
          audioRef.current = null
        }

        if (audioUrlRef.current === url) {
          URL.revokeObjectURL(url)
          audioUrlRef.current = null
        }

        return true
      } catch (error) {
        console.error('Erro ao reproduzir a narração:', error)
        return false
      }
    },
    [stopAudio],
  )

  const announceName = useCallback(
    async (name) => {
      const sequenceId = ++sequenceRef.current

      stopAudio()
      setIsSpeaking(true)
      setIsRevealing(true)
      setIsDrawModalOpen(false)
      setSelectedName('')
      setMessage('Preparando o resultado...')

      await playSound('/tambores.mp3')

      if (sequenceId !== sequenceRef.current) return

      setSelectedName(name)
      setIsRevealing(false)
      setIsDrawModalOpen(true)
      setMessage(`O nome sorteado foi ${name}!`)

      if (ttsRef.current) {
        await playVoice(name)
      }

      if (sequenceId !== sequenceRef.current) return

      await playSound('/victory.mp3')

      if (sequenceId !== sequenceRef.current) return

      setIsSpeaking(false)
    },
    [playSound, playVoice, stopAudio],
  )

  function handleDraw() {
    if (isSpeaking) return

    if (uniqueNames.length === 0) {
      setMessage('Adicione pelo menos um participante antes de sortear.')
      return
    }

    let availableNames = uniqueNames

    if (drawMode === 'unique') {
      availableNames = uniqueNames.filter(
        (name) => !drawnNames.includes(name),
      )

      if (availableNames.length === 0) {
        setDrawnNames([])
        availableNames = uniqueNames
        setMessage('Todos foram sorteados! Um novo ciclo começou.')
      }
    }

    const randomIndex = Math.floor(Math.random() * availableNames.length)
    const name = availableNames[randomIndex]

    if (drawMode === 'unique') {
      setDrawnNames((previous) => [...previous, name])
    }

    announceName(name)
  }

  function handleAddName(event) {
    event.preventDefault()

    const name = newName.trim()

    if (!name) return

    if (uniqueNames.includes(name)) {
      setMessage('Esse participante já está na lista.')
      return
    }

    setNamesText((previous) =>
      previous.trim() ? `${previous.trim()}\n${name}` : name,
    )

    setNewName('')
    setDrawnNames((previous) => previous.filter((item) => item !== name))
    setGroups([])
    setMessage(`${name} foi adicionado à lista.`)
  }

  function removeName(nameToRemove) {
    setNamesText((previous) =>
      previous
        .split('\n')
        .filter((name) => name.trim() !== nameToRemove)
        .join('\n'),
    )

    setDrawnNames((previous) =>
      previous.filter((name) => name !== nameToRemove),
    )

    setGroups([])
    setMessage(`${nameToRemove} foi removido da lista.`)
  }

  function clearNames() {
    sequenceRef.current += 1
    stopAudio()

    setNamesText('')
    setNewName('')
    setSelectedName('')
    setDrawnNames([])
    setGroups([])
    setIsSpeaking(false)
    setIsRevealing(false)
    setIsDrawModalOpen(false)
    setIsGroupsModalOpen(false)
    setMessage('Lista limpa. Adicione novos participantes.')
  }

  function resetDraws() {
    setDrawnNames([])
    setMessage('O ciclo de sorteios foi reiniciado.')
  }

  function changeMode(mode) {
    setDrawMode(mode)
    setDrawnNames([])
    setMessage(
      mode === 'random'
        ? 'Modo aleatório: os nomes podem se repetir.'
        : 'Modo sem repetição: cada participante será sorteado uma vez por ciclo.',
    )
  }

  async function playSelectedAgain() {
    if (!selectedName || isSpeaking) return

    setIsSpeaking(true)

    if (ttsRef.current) {
      await playVoice(selectedName)
    } else {
      setMessage('A narração não está disponível neste momento.')
    }

    setIsSpeaking(false)
  }

  function handleGenerateGroups() {
    if (uniqueNames.length < 2) {
      setMessage('Adicione pelo menos dois participantes para formar grupos.')
      return
    }

    const shuffled = [...uniqueNames]

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    const generatedGroups = []
    let startIndex = 0

    if (shuffled.length % 2 !== 0) {
      generatedGroups.push(shuffled.slice(0, 3))
      startIndex = 3
    }

    for (let i = startIndex; i < shuffled.length; i += 2) {
      generatedGroups.push(shuffled.slice(i, i + 2))
    }

    setGroups(generatedGroups)
    setIsGroupsModalOpen(true)
  }

  const visibleGroups = groups
    .map((group) => group.filter((name) => uniqueNames.includes(name)))
    .filter((group) => group.length > 0)

  function closeDrawModal() {
    setIsDrawModalOpen(false)
  }

  function closeGroupsModal() {
    setIsGroupsModalOpen(false)
  }

  return (
    <main className="min-h-dvh w-full max-w-full bg-slate-950 px-3 py-5 text-white sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto w-full min-w-0 max-w-6xl">
        {/* Cabeçalho */}
        <header className="mb-8 flex min-w-0 flex-col items-center gap-3 text-center sm:mb-10">
          <div className="flex size-14 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10 sm:size-16">
            <Sparkles className="size-7 text-amber-300 sm:size-8" />
          </div>

          <div className="mt-4 flex justify-center">
            <InstallButton />
          </div>

          <h1 className="break-words text-2xl font-black tracking-tight sm:text-3xl md:text-4xl">
            Name Picker
          </h1>
          
          <h2 className="break-words text-xl font-black tracking-tight sm:text-xl md:text-xl">
            Sorteador de Nomes e Organizador de Grupos Maneiríssimo do Augusto
          </h2>

        </header>

        {/* Conteúdo principal */}
        <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
          {/* Participantes */}
          <section className="min-w-0 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-xl sm:rounded-3xl sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-400/10">
                <UsersRound className="size-5 text-indigo-300" />
              </div>

              <div className="min-w-0">
                <h2 className="text-lg font-bold sm:text-xl">
                  Participantes
                </h2>
                <p className="text-sm text-slate-400">
                  {uniqueNames.length}{' '}
                  {uniqueNames.length === 1
                    ? 'participante cadastrado'
                    : 'participantes cadastrados'}
                </p>
              </div>
            </div>

            <form
              onSubmit={handleAddName}
              className="mb-4 flex min-w-0 flex-col gap-2 sm:flex-row"
            >
              <input
                type="text"
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                placeholder="Nome do participante"
                maxLength={100}
                className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
              />

              <button
                type="submit"
                disabled={!newName.trim()}
                className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 font-semibold transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
              >
                <Plus className="size-5" />
                Adicionar
              </button>
            </form>

            <label
              htmlFor="names"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Ou cole vários nomes, um por linha
            </label>

            <textarea
              id="names"
              value={namesText}
              onChange={(event) => {
                setNamesText(event.target.value)
                setGroups([])
              }}
              placeholder={'Augusto\nLindomar\nCiclana\nFulano'}
              rows={6}
              className="w-full min-w-0 resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base leading-relaxed text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
            />

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-slate-500">
                Nomes duplicados são ignorados.
              </p>

              <button
                type="button"
                onClick={clearNames}
                disabled={uniqueNames.length === 0}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-300 transition hover:bg-rose-400/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Trash2 className="size-4" />
                Limpar lista
              </button>
            </div>

            {uniqueNames.length > 0 && (
              <div className="mt-5 border-t border-slate-800 pt-4">
                <h3 className="mb-3 text-sm font-semibold text-slate-300">
                  Lista de participantes
                </h3>

                <ul className="flex max-h-64 min-w-0 flex-col gap-2 overflow-y-auto pr-1">
                  {uniqueNames.map((name, index) => (
                    <li
                      key={name}
                      className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2.5"
                    >
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-xs font-semibold text-slate-400">
                        {index + 1}
                      </span>

                      <span className="min-w-0 flex-1 break-words text-sm sm:text-base">
                        {name}
                      </span>

                      {drawnNames.includes(name) && drawMode === 'unique' && (
                        <span className="hidden shrink-0 items-center gap-1 text-xs text-emerald-300 sm:flex">
                          <CheckCircle2 className="size-4" />
                          Sorteado
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => removeName(name)}
                        aria-label={`Remover ${name}`}
                        title={`Remover ${name}`}
                        className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-rose-400/10 hover:text-rose-300"
                      >
                        <X className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Sorteio individual */}
          <section className="flex min-w-0 flex-col rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-xl sm:rounded-3xl sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/10">
                <Trophy className="size-5 text-amber-300" />
              </div>

              <div className="min-w-0">
                <h2 className="text-lg font-bold sm:text-xl">
                  Sorteio individual
                </h2>
                <p className="text-sm text-slate-400">
                  Escolha um participante aleatoriamente.
                </p>
              </div>
            </div>

            <div className="mb-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => changeMode('random')}
                aria-pressed={drawMode === 'random'}
                className={`min-w-0 rounded-xl border p-3 text-left transition ${
                  drawMode === 'random'
                    ? 'border-amber-400/50 bg-amber-400/10'
                    : 'border-slate-700 bg-slate-950/50 hover:border-slate-600'
                }`}
              >
                <span className="block text-sm font-semibold">
                  Aleatório
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-slate-400">
                  Permite repetir nomes.
                </span>
              </button>

              <button
                type="button"
                onClick={() => changeMode('unique')}
                aria-pressed={drawMode === 'unique'}
                className={`min-w-0 rounded-xl border p-3 text-left transition ${
                  drawMode === 'unique'
                    ? 'border-amber-400/50 bg-amber-400/10'
                    : 'border-slate-700 bg-slate-950/50 hover:border-slate-600'
                }`}
              >
                <span className="block text-sm font-semibold">
                  Sem repetição
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-slate-400">
                  Evita repetir até o ciclo terminar.
                </span>
              </button>
            </div>

            <div className="flex min-h-48 min-w-0 flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950/60 p-5 text-center sm:min-h-56 sm:p-6">
              {isRevealing ? (
                <>
                  <LoaderCircle className="mb-4 size-10 animate-spin text-amber-300" />
                  <p className="text-lg font-semibold text-amber-200">
                    Preparando o sorteio...
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    O resultado será revelado em instantes.
                  </p>
                </>
              ) : selectedName ? (
                <>
                  <Trophy className="mb-3 size-8 text-amber-300" />
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
                    Último resultado
                  </p>
                  <p className="break-words text-3xl font-black text-white sm:text-4xl md:text-5xl">
                    {selectedName}
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsDrawModalOpen(true)}
                    className="mt-5 rounded-lg px-4 py-2 text-sm font-medium text-amber-300 transition hover:bg-amber-300/10"
                  >
                    Ver resultado
                  </button>
                </>
              ) : (
                <>
                  <Shuffle className="mb-4 size-10 text-slate-600" />
                  <p className="text-base font-semibold text-slate-300">
                    Pronto para sortear?
                  </p>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-500">
                    O nome sorteado aparecerá aqui.
                  </p>
                </>
              )}
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleDraw}
                disabled={uniqueNames.length === 0 || isSpeaking}
                className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSpeaking ? (
                  <LoaderCircle className="size-5 animate-spin" />
                ) : (
                  <Shuffle className="size-5" />
                )}
                {isSpeaking ? 'Sorteando...' : 'Sortear nome'}
              </button>

              <button
                type="button"
                onClick={resetDraws}
                disabled={drawnNames.length === 0 || isSpeaking}
                className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-3 font-semibold text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RotateCcw className="size-4" />
                Reiniciar
              </button>
            </div>

            <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/50 p-3">
              <div className="flex items-start gap-2">
                {ttsReady ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-300" />
                ) : (
                  <AlertCircle className="mt-0.5 size-4 shrink-0 text-slate-500" />
                )}

                <div className="min-w-0 flex-1">
                  <p className="break-words text-xs text-slate-400">
                    {ttsStatus}
                  </p>

                  {!ttsReady && ttsStatus !== 'Narração indisponível' && (
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-indigo-400 transition-all"
                        style={{ width: `${ttsProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <p className="mt-4 min-w-0 break-words text-center text-sm text-slate-400">
              {message}
            </p>
          </section>
        </div>

        {/* Formação de grupos */}
        <section className="mt-4 min-w-0 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-xl sm:mt-6 sm:rounded-3xl sm:p-6">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-400/10">
                <Users className="size-5 text-indigo-300" />
              </div>

              <div className="min-w-0">
                <h2 className="text-lg font-bold sm:text-xl">
                  Formação de grupos
                </h2>
                <p className="text-sm leading-relaxed text-slate-400">
                  Misture os participantes em duplas e trio(s).
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerateGroups}
              disabled={uniqueNames.length < 2}
              className="flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 font-semibold transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
            >
              <Shuffle className="size-5" />
              Gerar grupos
            </button>
          </div>

          {groups.length > 0 && (
            <div className="mt-5 border-t border-slate-800 pt-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-slate-200">
                  Últimos grupos gerados
                </h3>

                <button
                  type="button"
                  onClick={handleGenerateGroups}
                  disabled={uniqueNames.length < 2}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-indigo-300 transition hover:bg-indigo-400/10 disabled:opacity-40"
                >
                  <RotateCcw className="size-4" />
                  Embaralhar novamente
                </button>
              </div>

              <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {visibleGroups.map((group, index) => (
                  <div
                    key={`${index}-${group.join('-')}`}
                    className="min-w-0 rounded-xl border border-slate-800 bg-slate-950/60 p-4"
                  >
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-indigo-300">
                      Grupo {index + 1}
                      {group.length === 3 ? ' · Trio' : ' · Dupla'}
                    </p>

                    <ul className="flex min-w-0 flex-col gap-2">
                      {group.map((name) => (
                        <li
                          key={name}
                          className="break-words rounded-lg bg-slate-900 px-3 py-2 text-sm text-slate-200"
                        >
                          {name}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <footer className="px-2 py-8 text-center text-xs text-slate-600">
          Name Picker do Augusto
        </footer>
      </div>

      {/* Modal do resultado individual */}
      {isDrawModalOpen && selectedName && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto overscroll-contain bg-black/85 p-3 pt-6 backdrop-blur-md sm:items-center sm:p-6"
          onClick={closeDrawModal}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="draw-modal-title"
            className="relative my-auto w-full min-w-0 max-w-lg shrink-0 animate-[reveal_600ms_ease-out] overflow-hidden rounded-2xl border border-amber-400/30 bg-slate-950 p-5 text-center shadow-[0_0_100px_rgba(245,158,11,0.15)] sm:rounded-3xl sm:p-8 md:p-12"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeDrawModal}
              aria-label="Fechar resultado"
              className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/10 hover:text-white sm:right-4 sm:top-4"
            >
              <X className="size-5" />
            </button>

            <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10 sm:mb-6 sm:size-20">
              <Trophy className="size-8 text-amber-300 sm:size-10" />
            </div>

            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-amber-300 sm:text-sm">
              Resultado do sorteio
            </p>

            <h2
              id="draw-modal-title"
              className="mb-6 break-words text-3xl font-black leading-tight text-white [overflow-wrap:anywhere] sm:mb-8 sm:text-4xl md:text-5xl"
            >
              {selectedName}
            </h2>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={playSelectedAgain}
                disabled={isSpeaking || !ttsReady}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 font-semibold text-amber-200 transition hover:bg-amber-400/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSpeaking ? (
                  <LoaderCircle className="size-5 animate-spin" />
                ) : (
                  <Volume2 className="size-5" />
                )}
                Ouvir nome novamente
              </button>

              <button
                type="button"
                onClick={closeDrawModal}
                className="flex min-h-12 w-full items-center justify-center rounded-xl bg-amber-400 px-4 py-3 font-bold text-slate-950 transition hover:bg-amber-300"
              >
                Continuar
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Modal de grupos */}
      {isGroupsModalOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto overscroll-contain bg-black/85 p-3 pt-6 backdrop-blur-md sm:items-center sm:p-6"
          onClick={closeGroupsModal}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="groups-modal-title"
            className="relative my-auto max-h-[calc(100dvh-3rem)] w-full min-w-0 max-w-2xl shrink-0 animate-[reveal_500ms_ease-out] overflow-x-hidden overflow-y-auto rounded-2xl border border-indigo-400/30 bg-slate-950 p-4 shadow-[0_0_80px_rgba(99,102,241,0.2)] sm:max-h-[calc(100dvh-3rem)] sm:rounded-3xl sm:p-6 md:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeGroupsModal}
              aria-label="Fechar grupos"
              className="absolute right-3 top-3 z-10 flex size-10 items-center justify-center rounded-full bg-slate-900 text-slate-400 transition hover:bg-slate-800 hover:text-white sm:right-4 sm:top-4"
            >
              <X className="size-5" />
            </button>

            <div className="mb-6 pr-10 sm:mb-8">
              <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-indigo-400/10">
                <UsersRound className="size-6 text-indigo-300" />
              </div>

              <h2
                id="groups-modal-title"
                className="break-words text-2xl font-black sm:text-3xl"
              >
                Grupos sorteados
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-slate-400 sm:text-base">
                Os participantes foram embaralhados aleatoriamente.
              </p>
            </div>

            {visibleGroups.length > 0 ? (
              <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
                {visibleGroups.map((group, index) => (
                  <div
                    key={`${index}-${group.join('-')}`}
                    className="min-w-0 rounded-xl border border-indigo-400/20 bg-slate-900/70 p-4"
                  >
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-bold text-indigo-200">
                        Grupo {index + 1}
                      </h3>

                      <span className="rounded-full bg-indigo-400/10 px-2.5 py-1 text-xs text-indigo-300">
                        {group.length === 3 ? 'Trio' : 'Dupla'}
                      </span>
                    </div>

                    <ul className="flex min-w-0 flex-col gap-2">
                      {group.map((name) => (
                        <li
                          key={name}
                          className="break-words rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-slate-200 [overflow-wrap:anywhere] sm:text-base"
                        >
                          {name}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-400">
                Não há grupos para exibir. Gere novos grupos com os
                participantes atuais.
              </p>
            )}

            <div className="mt-6 flex flex-col gap-3 border-t border-slate-800 pt-5 sm:flex-row">
              <button
                type="button"
                onClick={handleGenerateGroups}
                disabled={uniqueNames.length < 2}
                className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 font-semibold transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Shuffle className="size-5" />
                Sortear novamente
              </button>

              <button
                type="button"
                onClick={closeGroupsModal}
                className="flex min-h-12 items-center justify-center rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-300 transition hover:bg-slate-800"
              >
                Fechar
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
