import { PubSubEvent } from "@kinetix/core";
import { UserSettingLaunchPayload } from "./UserSettingLaunchPayload";

export class UserSettingLaunchEvent extends PubSubEvent<UserSettingLaunchPayload> {
  public static readonly Type = Symbol.for("UserSettingLaunchEvent");
}
