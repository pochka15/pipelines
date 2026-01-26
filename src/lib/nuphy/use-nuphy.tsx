import { useNuphyStore } from "@/lib/stores/nuphys-store";
import { createContext, useContext, useEffect } from "react";
import type { KeyHandler, KnownNuphy } from "./mappings";

interface UseNuphyOptions {
  name: KnownNuphy;
  enabled: boolean;
  keys: KeyHandler;
}

export type NuphyProviderContextType = {
  register: (name: KnownNuphy, handler: KeyHandler) => void;
  unregister: (name: KnownNuphy) => void;
};

export const NuphyProviderContext =
  createContext<NuphyProviderContextType | null>(null);

/**
 * Nuphy is like a keyboard listener. Just wanted to use this name.
 */
export const useNuphy = ({ name, enabled, keys }: UseNuphyOptions) => {
  const context = useContext(NuphyProviderContext);
  const disableModes = useNuphyStore((it) => it.disableModes);
  const enableMode = useNuphyStore((it) => it.enableMode);
  const getMode = useNuphyStore((it) => it.getMode);

  if (!context) {
    throw new Error("useNuphy must be used within a NuphyProvider");
  }

  const { register, unregister } = context;

  useEffect(() => {
    if (enabled) {
      register(name, keys);
    } else {
      unregister(name);
    }
  }, [name, keys, enabled, register, unregister]);

  useEffect(() => {
    return () => {
      unregister(name);
    };
  }, [unregister, name]);

  return { disableModes, enableMode, getMode };
};
