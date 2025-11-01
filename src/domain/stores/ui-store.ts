import type { UiWindow } from "@/lib/window";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface UiState {
  focusedPipelineId: string | null;
  commandsWindow: UiWindow;

  setFocusedPipeline: (id: string | null) => void;
  setCommandsWindow: (w: UiWindow) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      focusedPipelineId: null,
      commandsWindow: { cursor: 0, size: 1 },

      setFocusedPipeline: (id: string | null) => set({ focusedPipelineId: id }),
      setCommandsWindow: (w: UiWindow) => set({ commandsWindow: w }),
    }),
    {
      name: "ui-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
