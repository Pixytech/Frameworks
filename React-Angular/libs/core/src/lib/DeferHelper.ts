import { IDisposable } from "./Disposable";
import { IDeferSource } from "./Interfaces";

export class DeferHelper implements IDisposable {
  constructor(private deferSource: IDeferSource) {}

  dispose(): void {
    this.deferSource.endDefer();
  }
}
