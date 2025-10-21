import { IDisposable } from "../Core";
import { IDeferSource } from "./IDeferSource";


export class DeferHelper implements IDisposable {
  private source: IDeferSource | null;

  constructor(source: IDeferSource) {
    this.source = source;
  }

  public dispose(): void {
    if (this.source != null) {
      this.source.EndDefer();
      this.source = null;
    }
  }
}
