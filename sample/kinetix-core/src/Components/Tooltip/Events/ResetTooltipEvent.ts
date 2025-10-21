import { PubSubEvent } from "../../../Messaging";
import { IConfigurationId } from "../../../Configuration";

export class ResetTooltipPayload {

  public readonly toolTipConfigurations : IConfigurationId[]

  constructor(configIds: IConfigurationId[]) {
    this.toolTipConfigurations = configIds;
  }

}

export class ResetTooltipEvent extends PubSubEvent<ResetTooltipPayload> {
  public static readonly Type = Symbol.for("ResetTooltipEvent");
}
