import { IDeferSource, IDisposable } from "@kinetix/core";

export interface IRuleEngineBase extends IDeferSource, IDisposable {
  isSuspended(): boolean;
  suspend(): IDisposable;
}
