import { IRegistry, ObjectLifecycle,CoreTypes, IContainer} from "@kinetix/core";
import { Glue42Client } from "./Glue42Client";

export class Registry implements IRegistry {
    
  configure(container: IContainer): void {
    container.register(CoreTypes.IInteropClient,Glue42Client,ObjectLifecycle.Singleton);
  }
}


