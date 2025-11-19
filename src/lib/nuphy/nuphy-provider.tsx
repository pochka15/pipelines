"use client";

import { getKeysCombo } from "@/lib/random/keyboard-utils";
import { useEffect, useRef, type FC, type PropsWithChildren } from "react";
import { nuphyPriorities, type KeyHandler, type KnownNuphy } from "./mappings";
import {
  NuphyProviderContext,
  type NuphyProviderContextType,
} from "./use-nuphy";

export const NuphyProvider: FC<PropsWithChildren> = ({ children }) => {
  const handlersRef = useRef<Map<KnownNuphy, KeyHandler>>(new Map());
  const activeNuphysRef = useRef<KnownNuphy[]>([]);

  const register = (name: KnownNuphy, handler: KeyHandler) => {
    handlersRef.current.set(name, handler);
    const filtered = activeNuphysRef.current.filter((n) => n !== name);
    const newList = [...filtered, name];
    activeNuphysRef.current = newList.sort(
      (a, b) => nuphyPriorities[a] - nuphyPriorities[b]
    );
  };

  const unregister = (name: KnownNuphy) => {
    handlersRef.current.delete(name);
    activeNuphysRef.current = activeNuphysRef.current.filter((n) => n !== name);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const combo = getKeysCombo(event);
      if (combo === "cmd+j" || combo === "alt+j") event.preventDefault();

      activeNuphysRef.current.find((name) => {
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
