export type CameraMode = 'audience' | 'performer' | 'free'

export type Camera360State = {
  mode: CameraMode
  yaw: number
  pitch: number
  zoom: number
  seatRef?: string
}

export type CameraWorldLike = {
  players: Array<{ id: string; position?: string }>
  camera360?: Camera360State
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function ensureCamera360(world: CameraWorldLike): Camera360State {
  if (!world.camera360) {
    world.camera360 = {
      mode: 'audience',
      yaw: 0,
      pitch: 0,
      zoom: 1
    }
  }
  return world.camera360
}

export function setCameraMode(world: CameraWorldLike, mode: CameraMode): Camera360State {
  const state = ensureCamera360(world)
  state.mode = mode
  console.log('[CAMERA_MODE_SET]', { mode: state.mode, yaw: state.yaw, pitch: state.pitch })
  return state
}

export function rotateCamera(world: CameraWorldLike, yaw: number, pitch: number): Camera360State {
  const state = ensureCamera360(world)
  state.yaw = clamp(yaw, -180, 180)
  state.pitch = clamp(pitch, -89, 89)
  console.log('[CAMERA_ROTATE]', { mode: state.mode, yaw: state.yaw, pitch: state.pitch })
  return state
}

export function setSeatCamera(
  world: CameraWorldLike,
  playerId: string,
  seatId?: string
): Camera360State | null {
  const player = world.players.find(p => p.id === playerId)
  if (!player) return null

  const state = ensureCamera360(world)
  state.seatRef = seatId ?? player.position ?? 'standing'
  console.log('[CAMERA_SEAT_ATTACH]', { playerId, seatRef: state.seatRef })
  return state
}

export function getCameraView(world: CameraWorldLike): Camera360State {
  const state = ensureCamera360(world)
  console.log('[CAMERA_VIEW]', {
    mode: state.mode,
    yaw: state.yaw,
    pitch: state.pitch,
    zoom: state.zoom,
    seatRef: state.seatRef ?? 'none'
  })
  return state
}
