
import { IocInjectable } from "../IoC/Injectables";
import { IInteropClient } from "./IInteropClient";
import { IInteropProvider } from "./IInteropProvider";
import { InteropContainerType } from "./InteropContainerType";

@IocInjectable()
export class InteropProviderViewModel implements IInteropProvider {
  isPlatformAvailable: boolean = false;

  async initialize(client: IInteropClient, containerType: InteropContainerType): Promise<void> {
    this.containerType = containerType;
    console.debug("interop client initialize", client);
    if (client) {
      this.isPlatformAvailable = await client.initialize();
      this.interop = client;
    }
    console.debug("interop isPlatformAvailable", this.isPlatformAvailable);
  }

  containerType: InteropContainerType;

  interop: IInteropClient | undefined;
}
