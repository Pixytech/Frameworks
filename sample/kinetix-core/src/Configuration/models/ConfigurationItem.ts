import { CustomizedAt, IConfigurationItem } from "./IConfigurationItem";

export class ConfigurationItem<T> implements IConfigurationItem<T> {
  appliesTo: string[];
  customizedAt: CustomizedAt = CustomizedAt.User;
  application: string;
  category: string;
  section: string;
  item: string;
  value: T;
}
