import { CoreTypes, type IConfigurationId, type IConfigurationService, IocInject, IocInjectable, CustomizedAt } from "@kinetix/core";
import { IUserPreferenceContext } from "./Widgets";

export interface IUserSettings {
  preference: IUserPreferenceContext;
  initialize(): Promise<void>;
  saveSetting(preference: Partial<IUserPreferenceContext>): Promise<void>;
}

@IocInjectable()
export class UserSettings implements IUserSettings {
  protected readonly configurationId: IConfigurationId = {
    application: "Monza",
    category: "Workspace",
    section: "Dashboard",
    item: "Preference",
  };
  protected readonly configService: IConfigurationService;
  public preference: IUserPreferenceContext;
  constructor(
    @IocInject(CoreTypes.IConfigurationService)
    configService: IConfigurationService
  ) {
    this.configService = configService;
  }

  async initialize(): Promise<void> {
    let userPreference = await this.configService.getConfiguration<IUserPreferenceContext>(this.configurationId);

    if (userPreference && userPreference.value && userPreference.value.currencySettings) {
      this.preference = userPreference.value;
    }
  }

  async saveSetting(preference: Partial<IUserPreferenceContext>): Promise<void> {
    this.preference = { ...this.preference, ...preference };
    await this.configService.saveConfiguration({
      application: this.configurationId.application,
      category: this.configurationId.category,
      section: this.configurationId.section,
      item: this.configurationId.item,
      customizedAt: CustomizedAt.User,
      appliesTo: [],
      value: this.preference,
    });
  }
}
