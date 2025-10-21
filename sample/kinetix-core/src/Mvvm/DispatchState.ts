import { Dispatch, SetStateAction } from "react";

export function DispatchState<S>(callback: Dispatch<SetStateAction<S>>, state: S): void {
  callback({ ...state });
}
