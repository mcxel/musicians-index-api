import { create } from "zustand";
import type { MediaItem } from "@/lib/media/media";

type ModalType = "universal-action-menu";

interface ModalPayload {
  mediaItem?: MediaItem;
}

interface ModalStore {
  type: ModalType | null;
  payload: ModalPayload;
  isOpen: boolean;
  openModal: (type: ModalType, payload: ModalPayload) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  type: null,
  payload: {},
  isOpen: false,
  openModal: (type, payload) => set({ isOpen: true, type, payload }),
  closeModal: () => set({ isOpen: false, type: null, payload: {} }),
}));