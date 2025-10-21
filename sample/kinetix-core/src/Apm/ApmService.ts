import { BuildManifest,LogLevel } from "../Components/AppManifest";
import { CoreTypes } from "../CoreTypes";
import { type IContainer, IocInject } from "../IoC";
import { DefaultApmAdapter } from "./Adapters/DefaultAdapter";
import { IApmAdapter, IApmAdapterType } from "./IApmAdapter";
import { IApmService } from "./IApmService";

export class ApmService implements IApmService {
  private _apm: IApmAdapter = new DefaultApmAdapter();
  builder: IContainer;

  constructor(@IocInject(CoreTypes.IContainer) builder: IContainer) {
    this.builder = builder;
  }

  async initialize(
    profile: string,
    buildInfo: BuildManifest,
    loglevel?: LogLevel
  ): Promise<void> {
    console.debug("creating APM adapter for ", buildInfo.apmServiceType);

    const adapters = this.builder.buildAll<IApmAdapter>(IApmAdapterType);
    const adapter = adapters.find(
      (x) => x.name === `${buildInfo.apmServiceType}`.toLowerCase()
    );
    this._apm = adapter ? adapter : this.createDefaultAPM();

    console.debug("initializing APM", buildInfo);
    await this._apm.initialize(profile, buildInfo, loglevel);
  }

  private createDefaultAPM(): IApmAdapter {
    return new DefaultApmAdapter();
  }

  get Apm(): IApmAdapter {
    return this._apm;
  }
}
