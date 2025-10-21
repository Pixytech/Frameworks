import { PubSubEvent } from "@kinetix/core";
import { BlotterData } from "../BlotterData";

export class BlotterLaunchEvent extends PubSubEvent<BlotterData> {
  public static readonly Type = Symbol.for("BlotterLaunchEvent");
}
