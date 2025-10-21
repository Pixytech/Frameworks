import { IUserPreferenceContext } from "../..";

export class UserSettingLaunchPayload {
  constructor(preference: IUserPreferenceContext, type: string) {
    this.preference = preference;
    this.type = type;
  }

  public readonly type: string;
  public readonly preference: IUserPreferenceContext;
}
