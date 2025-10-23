import { callerIdentity, CoreTypes, IAuthenticationServiceType, IDialogContext, IDisposable, IInteropClient, INotificationServiceType, IntentContext, IocInject, IocInjectable, ObjectLifecycle, SubscriptionToken } from "@kinetix/core";
import Glue, { Glue42 } from "@glue42/desktop";
import type { IAuthenticationService, IContainer } from "@kinetix/core";
import { GlueNotificationService } from "./GlueNotificationService";
@IocInjectable()
export class Glue42Client implements IInteropClient {
  private readonly authService: IAuthenticationService;
  private readonly container: IContainer;

  constructor(@IocInject(IAuthenticationServiceType) authService: IAuthenticationService, @IocInject(CoreTypes.IContainer) container: IContainer) {
    this.authService = authService;
    this.container = container;
    this.isPlatformInstalled = false;
  }

  isPlatformInstalled: boolean;

  get PlatformMessage(): string {
    return "Use Glue42 launcher";
  }

  async launchPlatform(): Promise<void> {
    window.open("https://docs.glue42.com/getting-started/how-to/install/index.html", "_blank", "noopener,noreferrer");
  }

  async installPlatform(): Promise<void> {
    window.open("https://docs.glue42.com/getting-started/how-to/install/index.html", "_blank", "noopener,noreferrer");
  }

  async updateHost(context: IDialogContext): Promise<void> {
    const currentWindow = this.glue.windows.my();
    if (currentWindow) {
      if (context.initialWidth && context.initialHeight) {
        await currentWindow.resizeTo(context.initialWidth, context.initialHeight);
        await currentWindow.center();
      }
      if (context.title) {
        document.title = `${context.title}`;
      }
      switch (context.windowAction) {
        case "CLOSE":
          await currentWindow.close();
          break;
        case "MINIMIZE":
          await currentWindow.minimize();
          break;
        case "RESTORE":
          console.debug("restoring window");
          const size = currentWindow.state;
          if (size === "maximized") {
            await currentWindow.restore();
            return;
          }
          await currentWindow.maximize();
          break;
        default:
          break;
      }
    }
  }
  glue: Glue42.Glue;

  async initialize(): Promise<boolean> {
    console.debug(`Init glue42`);
    this.glue = await Glue({});

    console.debug("openfin client initialize", this.glue.info);
    const isGlue = this.glue.info !== undefined;
    if (isGlue) {
      this.isPlatformInstalled = true;
      await this.configureInteropServices();
    }
    return isGlue;
  }

  async configureInteropServices(): Promise<void> {
    this.container.deregister(INotificationServiceType);
    this.container.register(INotificationServiceType, GlueNotificationService, ObjectLifecycle.Singleton);
  }

  async raiseIntent(name: string, context: IntentContext): Promise<void> {
    const userId = this.authService.GetUsername();
    const intentDataWithAuth = context.data;
    if (userId && intentDataWithAuth) {
      intentDataWithAuth[callerIdentity] = userId;
    }
    await this.glue.intents.raise({ intent: name, context: { data: intentDataWithAuth, type: context.type } });
  }

  async registerIntentHandler(name: string, handler: (name: string, context: IntentContext) => Promise<void>): Promise<IDisposable> {
    const subscription = this.glue.intents.addIntentListener(name, async (intent) => {
      await handler(name, { data: intent.data, type: intent.type ? intent.type : "" });
    });

    return new SubscriptionToken(() => {
      subscription.unsubscribe();
    });
  }
}
