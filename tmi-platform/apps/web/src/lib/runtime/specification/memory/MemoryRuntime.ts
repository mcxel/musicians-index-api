import type { MemoryWallEngine } from "./MemoryWallEngine";
import type { MemoryCaptureEngine } from "./MemoryCaptureEngine";
import type { MemoryGalleryEngine } from "./MemoryGalleryEngine";
import type { PolaroidEngine } from "./PolaroidEngine";

export interface MemoryRuntime {
  wall: MemoryWallEngine;
  capture: MemoryCaptureEngine;
  gallery: MemoryGalleryEngine;
  polaroid: PolaroidEngine;
}
