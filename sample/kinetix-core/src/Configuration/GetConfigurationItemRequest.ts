import { IConfigurationId } from "./models/IConfigurationId";

export class GetConfigurationItemRequest implements IConfigurationId {
  application: string;
  category: string;
  section: string;
  item: string;
}
