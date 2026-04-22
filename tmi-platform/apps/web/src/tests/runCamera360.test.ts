import { getCameraView, rotateCamera, setCameraMode, setSeatCamera } from '../engines/world/camera360.engine'

function runCamera360Test() {
  const world = {
    players: [{ id: 'user1', position: 'seat' as string }]
  }

  setCameraMode(world, 'audience')
  rotateCamera(world, 20, 10)
  rotateCamera(world, -15, 2)

  setCameraMode(world, 'performer')
  rotateCamera(world, 85, 27)

  setCameraMode(world, 'free')
  rotateCamera(world, 200, 120)

  setSeatCamera(world, 'user1', 'crowd_main_r3_i1')
  const view = getCameraView(world)

  console.log('[CAMERA360_ASSERT]', {
    attachedMode: view.mode,
    attachedSeatRef: view.seatRef,
    freeMode: view.mode,
    freeYaw: view.yaw,
    freePitch: view.pitch
  })
}

runCamera360Test()
