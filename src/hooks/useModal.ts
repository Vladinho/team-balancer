import { useState } from 'react';

export function useModal<T = null>() {
  const [isOpen, setOpen] = useState(false);
  const [data, setData] = useState<T | null>(null);

  function open(payload: T | null = null) {
    setData(payload);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setData(null);
  }

  return { isOpen, data, open, close };
}
