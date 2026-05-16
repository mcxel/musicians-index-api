import { useEffect, useState } from "react";

export function usePulse(interval = 2000) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => !prev);
    }, interval);

    return () => clearInterval(timer);
  }, [interval]);

  return active;
}
