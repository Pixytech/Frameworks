import { IocInjectable, ViewModelBase, Profile, delay, IDialogAware, IDialogComponent, IDialogContext, CoreTypes, type IDialogService, IocInject, type IRestClient, IRestClientType } from "@kinetix/core";
import { Guid } from "typescript-guid";
import { firstValueFrom } from "rxjs";

export class ExternalAppLauncherModel {
  message: string;
  frameSrc: string | undefined;
}

@IocInjectable()
export class ExternalAppLauncher extends ViewModelBase<ExternalAppLauncherModel> implements IDialogAware {
  dialogService: IDialogService;
  restClient: IRestClient;
  launchCode: string;
  maxTimesCheck: number = 10;
  constructor(@IocInject(CoreTypes.IDialogService) dialogService: IDialogService, @IocInject(IRestClientType) restClient: IRestClient) {
    super();
    this.restClient = restClient;
    this.dialogService = dialogService;
  }
  dialogContext: IDialogContext;
  OnDialogCreated(context: IDialogContext, dialogComponent?: IDialogComponent | undefined): void {
    context.initialHeight = 200;
    context.initialWidth = 200;
  }

  OnDialogClose(): void {
    //
  }
  profile: Profile;

  setClickOnce(profile: Profile) {
    this.profile = profile;
  }
  protected createModel(): ExternalAppLauncherModel {
    return new ExternalAppLauncherModel();
  }

  protected async onInitializeOnce(): Promise<void> {
    try {
      this.launchCode = Guid.create().toString();
      await this.launchApplication();
    } finally {
      this.dialogService.Close(this);
    }
  }

  private async launchApplication(): Promise<void> {
    const appName = this.profile.displayName;
    const clickOnce = this.profile.modules[0];
    const domain = window.location.hostname;
    const port = window.location.port;
    const address = `${domain}${port ? ":" + port : ""}`;

    const desktopProtocol = `kd://${address}${clickOnce}&code=${this.launchCode}`;
    const codeCheckUrl = `/desktop/protocol?code=${this.launchCode}`;
    console.log("Launching via desktop protocol");

    this.updateModel((m) => {
      m.message = `Starting app - ${appName}`;
      m.frameSrc = desktopProtocol;
    });

    let isLaunched = false;
    let timesCheck = 0;
    while (!isLaunched) {
      this.updateModel((m) => {
        m.message = `Starting ${appName}`;
      });

      const response = await firstValueFrom(this.restClient.get<{ code: string; exists: boolean }>(codeCheckUrl));

      console.log("Check if app launched", response);
      isLaunched = response.exists;
      timesCheck = timesCheck + 1;
      if (isLaunched || timesCheck > this.maxTimesCheck) {
        console.log("App launch check timeout", isLaunched, timesCheck);
        this.updateModel((m) => {
          m.message = `Detecting launcher`;
        });
        break;
      }
      this.updateModel((m) => {
        m.message = `Checking ${appName}`;
      });
      await delay(800);
    }
    if (!isLaunched) {
      console.log("Provider not installed, downloading provider.");
      this.updateModel((m) => {
        m.message = `Downloading launcher`;
      });
      window.location.href = clickOnce;
    }
  }
}
