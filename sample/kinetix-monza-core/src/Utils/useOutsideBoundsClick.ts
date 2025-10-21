import { useEffect, useRef } from "react";

export const useOutsideBoundsClick = (callback: any) => {
  const ref: any = useRef();

  useEffect(() => {
    const handleClick = (event: any) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [callback, ref]);

  return ref;
};
