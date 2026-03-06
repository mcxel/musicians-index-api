'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type VerifyResponse = {
  ok: boolean
  tokenStatus?: string
  valid?: boolean
  message?: string
  error?: string
}

type CheckinResponse = {
  ok: boolean
  tokenStatus?: string
  checkedInAt?: string
  message?: string
  error?: string
}

const API_BASE =
  process.env.NEXT_PUBLIC_TICKETS_API_BASE?.trim() || 'http://localhost:4000'

function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ')
}

export default function TicketScannerPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanTimerRef = useRef<number | null>(null)

  const [token, setToken] = useState('dev-sample-token-123')
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [busy, setBusy] = useState(false)

  const [cameraOn, setCameraOn] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [lastScanned, setLastScanned] = useState<string | null>(null)

  const [verifyResult, setVerifyResult] = useState<VerifyResponse | null>(null)
  const [checkinResult, setCheckinResult] = useState<CheckinResponse | null>(null)

  const [autoCheckin, setAutoCheckin] = useState(true)
  const [kioskMode, setKioskMode] = useState(false)
  const [flash, setFlash] = useState<'none' | 'good' | 'bad' | 'warn'>('none')

  const hasBarcodeDetector = useMemo(() => {
    return typeof window !== 'undefined' && 'BarcodeDetector' in window
  }, [])

  const statusTone = useMemo(() => {
    const v = verifyResult
    if (!v) return 'idle'
    if (!v.ok) return 'bad'
    if (v.valid) return 'good'
    return 'warn'
  }, [verifyResult])

  const stopCamera = useCallback(() => {
    setCameraOn(false)
    setCameraError(null)

    if (scanTimerRef.current) {
      window.clearInterval(scanTimerRef.current)
      scanTimerRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  // --- Audio helpers ---
  function playBeep() {
    try {
      // webkitAudioContext exists on older Safari; allow the explicit any here
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext
      const ctx = new AudioCtx()
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sine'
      o.frequency.value = 880
      g.gain.value = 0.05
      o.connect(g)
      g.connect(ctx.destination)
      o.start()
      setTimeout(() => {
        o.stop()
          try {
            ctx.close()
          } catch (e) { void e }
      }, 120)
    } catch (e) { void e }
  }

  function playBuzz() {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext
      const ctx = new AudioCtx()
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'square'
      o.frequency.value = 110
      g.gain.value = 0.06
      o.connect(g)
      g.connect(ctx.destination)
      o.start()
      setTimeout(() => {
        o.stop()
          try {
            ctx.close()
          } catch (e) { void e }
      }, 160)
    } catch (e) { void e }
  }

  function vibrateOk() {
    try {
      navigator.vibrate?.(40)
    } catch (e) { void e }
  }

  function vibrateBad() {
    try {
      navigator.vibrate?.([60, 30, 60])
    } catch (e) { void e }
  }

  // --- Fullscreen & Wake Lock helpers ---
  let wakeLock: { release?: () => Promise<void> } | null = null
  async function enableWakeLock() {
    try {
      // Wake Lock API not widely typed — allow runtime interop here.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      wakeLock = await (navigator as any).wakeLock?.request?.('screen')
    } catch (e) { void e }
  }
  async function disableWakeLock() {
    try {
      await (wakeLock as { release?: () => Promise<void> } | null)?.release?.()
      wakeLock = null
    } catch (e) { void e }
  }

  async function goFullscreen() {
    try {
      const el = document.documentElement
      if (!document.fullscreenElement) await el.requestFullscreen?.()
      else await document.exitFullscreen?.()
    } catch (e) { void e }
  }

  const postJson = async <T,>(path: string, body: unknown): Promise<T> => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body as unknown),
    })
    const json = await res.json().catch(() => ({}))
    return json as T
  }

  const handleVerify = useCallback(
    async (t?: string, opts?: { doAutoCheckin?: boolean }) => {
      const useToken = (t ?? token).trim()
      if (!useToken) return

      setBusy(true)
      setVerifyResult(null)
      setCheckinResult(null)

      try {
        const v = await postJson<VerifyResponse>('/api/tickets/verify', { token: useToken })
        setVerifyResult(v)

        // feedback
        if (v?.ok && v?.valid) {
          playBeep()
          vibrateOk()
        } else {
          playBuzz()
          vibrateBad()
        }

        const shouldAuto =
          (opts?.doAutoCheckin ?? false) && autoCheckin && v?.ok && v?.valid

        if (shouldAuto) {
          const c = await postJson<CheckinResponse>('/api/tickets/checkin', { token: useToken })
          setCheckinResult(c)
        }
      } finally {
        setBusy(false)
      }
    },
    [token, autoCheckin]
  )

  const handleCheckin = useCallback(async () => {
    const useToken = token.trim()
    if (!useToken) return

    setBusy(true)
    setCheckinResult(null)

    try {
      const c = await postJson<CheckinResponse>('/api/tickets/checkin', { token: useToken })
      setCheckinResult(c)
      if (c?.ok) {
        // double beep for checkin success
        playBeep()
        setTimeout(() => playBeep(), 140)
        vibrateOk()
      } else {
        playBuzz()
        vibrateBad()
      }
    } finally {
      setBusy(false)
    }
  }, [token])


  const startCamera = useCallback(async () => {
    setCameraError(null)
    setVerifyResult(null)
    setCheckinResult(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })
      streamRef.current = stream

      const video = videoRef.current
      if (!video) throw new Error('Video element not ready')

      video.srcObject = stream
      await video.play()

      setCameraOn(true)

      if (!hasBarcodeDetector) return

      // BarcodeDetector may be untyped in some environments — allow interop.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const detector = new (window as any).BarcodeDetector({
        formats: ['qr_code', 'code_128', 'code_39', 'ean_13', 'ean_8', 'upc_a', 'upc_e'],
      })

      scanTimerRef.current = window.setInterval(async () => {
        const v = videoRef.current
        const c = canvasRef.current
        if (!v || !c) return
        if (v.readyState < 2) return

        const w = v.videoWidth
        const h = v.videoHeight
        if (!w || !h) return

        const targetW = 720
        const scale = Math.min(1, targetW / w)
        c.width = Math.max(1, Math.floor(w * scale))
        c.height = Math.max(1, Math.floor(h * scale))

        const ctx = c.getContext('2d')
        if (!ctx) return
        ctx.drawImage(v, 0, 0, c.width, c.height)

        try {
          const codes = await detector.detect(c)
          if (!codes?.length) return
          const raw = String(codes[0].rawValue || '').trim()
          if (!raw) return

          if (raw === lastScanned) return

          setLastScanned(raw)
          setToken(raw)

          void handleVerify(raw, { doAutoCheckin: true })
        } catch (e) { void e }
      }, 350)
    } catch (e: unknown) {
      const err = e as { message?: string }
      setCameraError(err?.message || 'Failed to start camera')
      stopCamera()
    }
  }, [hasBarcodeDetector, lastScanned, stopCamera, handleVerify])

  useEffect(() => {
    return () => stopCamera()
  }, [stopCamera])

  // trigger visual flash when verifyResult changes
  useEffect(() => {
    if (!verifyResult) return
    if (verifyResult.ok && verifyResult.valid) {
      setFlash('good')
      setTimeout(() => setFlash('none'), 700)
    } else if (verifyResult.ok && !verifyResult.valid) {
      setFlash('bad')
      setTimeout(() => setFlash('none'), 700)
    } else {
      setFlash('warn')
      setTimeout(() => setFlash('none'), 700)
    }
  }, [verifyResult])


  // autofocus input on mount and when kiosk toggled
  useEffect(() => {
    inputRef.current?.focus()
  }, [kioskMode])

  // paste auto-verify
  const onPaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text')?.trim()
    if (text) {
      setToken(text)
      // slight delay to let state update
      setTimeout(() => void handleVerify(text, { doAutoCheckin: autoCheckin }), 50)
    }
  }, [autoCheckin, handleVerify])

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-8">
      <div className={cx('rounded-3xl border border-white/10 bg-black/40 p-5 shadow-sm relative overflow-hidden',
        flash === 'good' && 'ring-4 ring-lime-500/30',
        flash === 'bad' && 'ring-4 ring-red-500/30',
        flash === 'warn' && 'ring-4 ring-yellow-500/20'
      )}>
        {/* sheen overlay */}
        <div aria-hidden className={cx('pointer-events-none absolute inset-0 opacity-0 transition-opacity', flash !== 'none' && 'opacity-80')}>
          <div className="absolute -left-1/3 top-0 h-full w-1/2 rotate-12 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-[2px] animate-[sheen_0.9s_linear]" />
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-white/60">Ticket Scanner</div>
            <h1 className="text-2xl font-semibold text-white">
              Verify & Check-in
              <span className="ml-2 text-sm font-normal text-lime-300/80">(DEV API: {API_BASE})</span>
            </h1>
            <p className="mt-1 text-sm text-white/70">
              Camera scanning uses <span className="text-white/90">BarcodeDetector</span> when available.
              Manual token entry always works.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              className={cx(
                'rounded-2xl border px-4 py-2 text-sm font-medium shadow-sm transition',
                cameraOn
                  ? 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10'
                  : 'border-lime-400/30 bg-lime-400/10 text-lime-200 hover:bg-lime-400/15'
              )}
              onClick={() => (cameraOn ? stopCamera() : void startCamera())}
              type="button"
            >
              {cameraOn ? 'Stop Camera' : 'Start Camera'}
            </button>

            <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80">
              <input
                type="checkbox"
                checked={autoCheckin}
                onChange={(e) => setAutoCheckin(e.target.checked)}
              />
              Auto check-in after valid verify
            </label>
          </div>
          {/* Status badge */}
          <div className="absolute right-6 top-6 z-20">
            <div className={cx(
              'rounded-full px-4 py-2 font-semibold shadow-lg text-sm',
              statusTone === 'good' && 'bg-lime-500 text-black',
              statusTone === 'bad' && 'bg-red-500 text-white',
              statusTone === 'warn' && 'bg-yellow-400 text-black',
              statusTone === 'idle' && 'bg-white/5 text-white/70'
            )}>
              {verifyResult ? (verifyResult.valid ? 'VALID' : 'INVALID') : 'READY'}
            </div>
          </div>
        </div>

        {cameraError && (
          <div className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">
            Camera error: {cameraError}
          </div>
        )}

        {!hasBarcodeDetector && (
          <div className="mt-4 rounded-2xl border border-yellow-400/30 bg-yellow-500/10 p-3 text-sm text-yellow-200">
            BarcodeDetector is not available in this browser. Use manual token entry, or try Chrome/Edge.
          </div>
        )}

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
            <div className="text-sm font-medium text-white/90">Camera Preview</div>
            <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-black">
              <video ref={videoRef} className="h-[320px] w-full object-cover" playsInline muted />
            </div>
            <canvas ref={canvasRef} className="hidden" />

            <div className="mt-3 text-xs text-white/60">
              Last scanned: <span className="text-white/85">{lastScanned ? lastScanned : '—'}</span>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
            <div className="text-sm font-medium text-white/90">Manual Token</div>

            <div className="mt-3 flex flex-col gap-2">
              <input
                ref={inputRef}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                onPaste={onPaste}
                placeholder="Paste ticket token or QR value…"
                className={cx(
                  'w-full rounded-2xl border px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-lime-400/40',
                  kioskMode ? 'text-2xl px-6 py-4' : 'bg-black/40'
                )}
              />

              <div className="flex flex-wrap gap-2">
                <button
                  className="rounded-2xl border border-lime-400/30 bg-lime-400/10 px-4 py-2 text-sm font-medium text-lime-200 hover:bg-lime-400/15 disabled:opacity-50"
                  onClick={() => void handleVerify()}
                  disabled={busy}
                  type="button"
                >
                  Verify
                </button>

                <button
                  className={cx(
                    'rounded-2xl border px-4 py-2 text-sm font-medium hover:bg-white/10 disabled:opacity-50',
                    kioskMode
                      ? 'border-white/10 bg-lime-500/80 text-white text-2xl px-6 py-4'
                      : 'border-white/10 bg-white/5 text-white/80'
                  )}
                  onClick={() => void handleCheckin()}
                  disabled={busy}
                  type="button"
                >
                  Check-in
                </button>

                <button
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10 disabled:opacity-50"
                  onClick={() => {
                    setVerifyResult(null)
                    setCheckinResult(null)
                    setLastScanned(null)
                  }}
                  disabled={busy}
                  type="button"
                >
                  Clear
                </button>
                <button
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10"
                  onClick={() => {
                    setKioskMode((s) => !s)
                    if (!kioskMode) {
                      enableWakeLock()
                    } else {
                      disableWakeLock()
                    }
                  }}
                  type="button"
                >
                  {kioskMode ? 'Exit Kiosk' : 'Kiosk Mode'}
                </button>
                <button
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10"
                  onClick={() => void goFullscreen()}
                  type="button"
                >
                  Fullscreen
                </button>
              </div>

              <div
                className={cx(
                  'mt-2 rounded-2xl border p-3 text-sm',
                  statusTone === 'idle' && 'border-white/10 bg-white/5 text-white/70',
                  statusTone === 'good' && 'border-lime-400/30 bg-lime-400/10 text-lime-200',
                  statusTone === 'warn' && 'border-yellow-400/30 bg-yellow-500/10 text-yellow-200',
                  statusTone === 'bad' && 'border-red-400/30 bg-red-500/10 text-red-200'
                )}
              >
                <div className="font-medium">Status</div>
                <div className="mt-1">
                  {verifyResult
                    ? `${verifyResult.message ?? verifyResult.error ?? '—'} (status: ${
                        verifyResult.tokenStatus ?? '—'
                      }, valid: ${String(verifyResult.valid ?? false)})`
                    : 'No verify result yet.'}
                </div>

                {checkinResult && (
                  <div className="mt-2 text-xs text-white/80">
                    Check-in: {checkinResult.message ?? checkinResult.error ?? '—'}{' '}
                    {checkinResult.checkedInAt ? `@ ${checkinResult.checkedInAt}` : ''}
                  </div>
                )}
              </div>

              <div className="mt-2 text-xs text-white/50">
                Tip: if your web app runs on :3000, keep the dev API on :4000. You can set{' '}
                <span className="text-white/70">NEXT_PUBLIC_TICKETS_API_BASE</span> if you ever move it.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-white/10 bg-black/30 p-4 text-sm text-white/70">
        <div className="font-medium text-white/85">Door Flow (what staff does)</div>
        <ol className="mt-2 list-decimal pl-5">
          <li>Scan QR (or paste token)</li>
          <li>System verifies</li>
          <li>If valid → check-in locks it (prevents reuse)</li>
          <li>If already checked-in → reject entry</li>
        </ol>
      </div>
    </div>
  )
}
