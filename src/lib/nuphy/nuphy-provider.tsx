"use client";

import { getKeysCombo } from "@/lib/random/keyboard-utils";
import { useNuphyStore } from "@/lib/stores/nuphys-store";
import { useEffect, useRef, type FC, type PropsWithChildren } from "react";
import { nuphyPriorities, type KeyHandler, type KnownNuphy } from "./mappings";
import {
  NuphyProviderContext,
  type NuphyProviderContextType,
} from "./use-nuphy";

export const NuphyProvider: FC<PropsWithChildren> = ({ children }) => {
  const handlersRef = useRef<Map<KnownNuphy, KeyHandler>>(new Map());
  const activeNuphysRef = useRef<Set<KnownNuphy>>(new Set());
  const sortedActiveNuphysRef = useRef<KnownNuphy[]>([]);
  const setActiveNuphys = useNuphyStore((it) => it.setActiveNuphys);

  const updActive = (name: KnownNuphy, rm: boolean) => {
    if (rm) activeNuphysRef.current.delete(name);
    else activeNuphysRef.current.add(name);

    sortedActiveNuphysRef.current = Array.from(activeNuphysRef.current).sort(
      (a, b) => nuphyPriorities[a] - nuphyPriorities[b]
    );

    return sortedActiveNuphysRef.current;
  };

  const register = (name: KnownNuphy, handler: KeyHandler) => {
    handlersRef.current.set(name, handler);
    const hadBefore = activeNuphysRef.current.has(name);
    if (!hadBefore) setActiveNuphys(updActive(name, false));
  };

  const unregister = (name: KnownNuphy) => {
    handlersRef.current.delete(name);
    const hadBefore = activeNuphysRef.current.has(name);
    if (hadBefore) setActiveNuphys(updActive(name, true));
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const combo = getKeysCombo(event);
      if (combo === "cmd+j" || combo === "alt+j") event.preventDefault();

      sortedActiveNuphysRef.current.find((name) => {
        const handler = handlersRef.current.get(name);
        return handler && handler(combo, event);
      });
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const value: NuphyProviderContextType = { register, unregister };

  return (
    <NuphyProviderContext.Provider value={value}>
      {children}
    </NuphyProviderContext.Provider>
  );
};
