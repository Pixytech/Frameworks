import { IConfigurationId } from "./IConfigurationId";

export interface IConfigurationItem<T> extends IConfigurationId {
  customizedAt: CustomizedAt;
  value: T;
  appliesTo: string[];
}

export enum CustomizedAt {
  User = "User",
  Group = "Group",
  Role = "Role",
  Tenant = "Tenant",
  Kinetix = "Kinetix",
  Default = "Default",
}
