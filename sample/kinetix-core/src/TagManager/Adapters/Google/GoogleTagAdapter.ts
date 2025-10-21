
import { type IAuthenticationService, IAuthenticationServiceType } from "../../../Auth";
import { BuildManifest, GoogleTagManagerConfig } from "../../../Components/AppManifest";
import { IocInjectable, IocInject } from "../../../IoC";
import { ITagAdapter } from "../../ITagAdapter";
import TagManager from "react-gtm-module";
@IocInjectable()
export class GoogleTagAdapter implements ITagAdapter {
  name: string = "google";
  authenticationService: IAuthenticationService;

  constructor(@IocInject(IAuthenticationServiceType) authenticationService: IAuthenticationService) {
    this.authenticationService = authenticationService;
  }

  async initialize(profile: string, buildInfo: Partial<BuildManifest>): Promise<void> {
    const base64Encoded = `${buildInfo.tagManagerConfigs}`;
    const json = atob(base64Encoded);
    const configs = JSON.parse(json) as GoogleTagManagerConfig;
    const tagManagerArgs: TagManager.TagManagerArgs = {
      ...configs,
      dataLayer: {
        id: this.authenticationService.GetUserId(),
        username: this.authenticationService.GetUsername(),
        environment: buildInfo.environmentName,
        app: profile,
        token: this.authenticationService.GetParsedToken(),
      },
    };

    TagManager.initialize(tagManagerArgs);
    console.debug("initialized Google Tag Manager", profile, buildInfo);
  }

  createEvent(eventName: string, data: any): void {
    const tagData: TagManager.DataLayerArgs = {
      dataLayer: {
        event: eventName,
        ...data,
      },
    };
    TagManager.dataLayer(tagData);
    console.debug("Google dataLayer", tagData);
  }
}
