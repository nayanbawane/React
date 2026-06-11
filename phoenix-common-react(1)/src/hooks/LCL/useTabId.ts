import { useRef } from "react";

export function useTabId(): string {
  const tabIdRef = useRef<string>("");

  if (!tabIdRef.current) {
    tabIdRef.current = crypto.randomUUID();
  }

  return tabIdRef.current;
}