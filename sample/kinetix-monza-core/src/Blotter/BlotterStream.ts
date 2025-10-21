import { ConfigurationItem, CoreTypes, IocInject, IocInjectable, MessageStream,StreamBase,type  IConfigurationService } from "@kinetix/core";
import { Observable, mergeAll, bufferTime, filter, mergeMap, iif, of } from "rxjs";



export enum BlotterUpdateType {
  Single = "SINGLE",
}

export class BlotterStreamPayload extends StreamBase {
  datasetID: string;
  type: BlotterUpdateType;
}

export interface IBlotterStreamConfiguration {
  enableBatching: boolean;
  bufferTime: number;
  batchDelay: number;
  batchThreshold: number;
}

export class BlotterStreamConfigurationItem extends ConfigurationItem<IBlotterStreamConfiguration> {}

@IocInjectable()
export class BlotterStream extends MessageStream<BlotterStreamPayload> {
  public get name(): string {
    return "blotter_rtu"
  }
  
  readonly configService: IConfigurationService;
  config: IBlotterStreamConfiguration;

  constructor(@IocInject(CoreTypes.IConfigurationService) configService: IConfigurationService,) {
    super();
    this.configService = configService;
  }

  async initialize(): Promise<void> {
    const configItem = await this.configService.getConfiguration<IBlotterStreamConfiguration>({
      application: "Monza",
      category: "Workspace",
      section: "Blotter",
      item: "RTU",
    });
    if (configItem?.value) {
      this.config = configItem.value;
    } else {
      this.config = {
        enableBatching: true,
        bufferTime: 1000,
        batchDelay: 10000,
        batchThreshold: 5,
      };
    }
  }

  public forceRefresh(): void {
    this.process({ datasetID: "", type: BlotterUpdateType.Single });
  }

  isBrust(items: BlotterStreamPayload[]): boolean {
    const keys = items.map((x) => x.datasetID);
    const result = keys.reduce((a, c: string) => {
      a[c] = (a[c] || 0) + 1;
      return a;
    }, Object.create(null));
    const getGroupCounts = Object.keys(result).map((key) => result[key] as number);
    const isbrust = getGroupCounts.some((c) => c >= this.config.batchThreshold);
    return isbrust;
  }

  public get stream(): Observable<BlotterStreamPayload[]> {
    const result = this.subject.pipe(
      mergeAll(),
      bufferTime(this.config.bufferTime),
      filter((items) => items.length > 0),
      mergeMap((v) =>
        iif(
          () => this.isBrust(v),
          of(v).pipe(
            mergeAll(),
            bufferTime(this.config.batchDelay),
            filter((items) => items.length > 0)
          ),
          of(v)
        )
      )
    );

    return result;
  }
}
