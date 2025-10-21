
import { IDialogContext } from "../Components/DialogService/IDialogContext";
import { IDisposable } from "../Core";
import { IntentContext } from "./IntentContext";

export interface IInteropClient {
  PlatformMessage: string;
  isPlatformInstalled: boolean;

  launchPlatform(): Promise<void>;
  installPlatform(): Promise<void>;

  initialize(): Promise<boolean>;
  updateHost(context: IDialogContext): Promise<void>;
  raiseIntent(name: string, data: IntentContext): Promise<void>;
  registerIntentHandler(name: string, handler: (name: string, context: IntentContext) => Promise<void>): Promise<IDisposable>;
}
