import { remove } from "lodash";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export type Command = {
  id: string;
  value: string;
  description?: string;
};

export type NewPipeline = {
  title: string;
  commands: Command[];
};

export type Pipeline = NewPipeline & {
  id: string;
};

export type PipelinesState = {
  pipelines: Pipeline[];

  addPipeline: (pipeline: NewPipeline) => void;
  removePipeline: (id: string) => void;
  updatePipeline: (pipeline: Pipeline) => void;
  backup: () => void;
  restore: () => Promise<void>;
};

export const usePipelinesStore = create<PipelinesState>()(
  persist(
    immer((set, get) => ({
      pipelines: [],

      addPipeline: (pipeline: NewPipeline) =>
        set((state) => {
          state.pipelines.push({ ...pipeline, id: crypto.randomUUID() });
        }),

      removePipeline: (id: string) =>
        set((state) => {
          remove(state.pipelines, (p) => p.id === id);
        }),

      updatePipeline: (pipeline: Pipeline) =>
        set((state) => {
          const index = state.pipelines.findIndex((p) => p.id === pipeline.id);
          if (index !== -1) {
            state.pipelines[index] = pipeline;
          }
        }),

      backup: () => {
        const state = get();
        const json = JSON.stringify(state.pipelines);
        navigator.clipboard.writeText(json);
      },

      restore: async () => {
        try {
          const text = await navigator.clipboard.readText();
          const pipelines = JSON.parse(text);
          if (Array.isArray(pipelines)) {
            set((state) => {
              state.pipelines = pipelines;
            });
          }
        } catch (error) {
          console.error("Failed to restore pipelines:", error);
        }
      },
    })),
    {
      name: "pipelines-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        // Ensure pipelines is always an array
        if (!state?.pipelines || !Array.isArray(state.pipelines)) {
          state!.pipelines = [];
        }
      },
    }
  )
);
