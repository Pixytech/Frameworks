import { IInteropClient } from "./IInteropClient";
import { InteropContainerType } from "./InteropContainerType";

export interface IInteropProvider {
  isPlatformAvailable: boolean;

  initialize(client: IInteropClient | undefined, containerType: InteropContainerType): Promise<void>;
  readonly interop: IInteropClient | undefined;

  readonly containerType: InteropContainerType;
}
