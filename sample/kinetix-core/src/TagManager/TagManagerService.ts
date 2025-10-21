
import { IAuthenticationServiceType, type IAuthenticationService } from "../Auth";
import { BuildManifest } from "../Components/AppManifest";
import { CoreTypes } from "../CoreTypes";
import { type IContainer, IocInject, IocInjectable } from "../IoC";
import { DefaultTagAdapter } from "./Adapters/DefaultTagAdapter";
import { ITagAdapter, ITagAdapterType, ITagLogger } from "./ITagAdapter";
import { ITagManagerService } from "./ITagManagerService";

@IocInjectable()
export class TagManagerService implements ITagManagerService {
  private _tagAdapter: ITagAdapter;
  builder: IContainer;

  constructor(@IocInject(CoreTypes.IContainer) builder: IContainer, @IocInject(IAuthenticationServiceType) authService: IAuthenticationService) {
    this.builder = builder;
    this._tagAdapter = new DefaultTagAdapter(authService);
  }
  get Tag(): ITagLogger {
    return this._tagAdapter;
  }

  async initialize(profile: string, buildInfo: BuildManifest): Promise<void> {
    console.debug("creating Tag adapter for ", buildInfo.tagManagerType);

    const adapters = this.builder.buildAll<ITagAdapter>(ITagAdapterType);
    const adapter = adapters.find((x) => {
      return x.name === `${buildInfo.tagManagerType}`.toLowerCase();
    });
    if (adapter) {
      this._tagAdapter = adapter;
    }

    console.debug("initializing tag adapter", buildInfo);
    await this._tagAdapter.initialize(profile, buildInfo);
    this._tagAdapter.createEvent("gtm.pageview", { context: { sectionTitle: "Login" } });
  }
}
