import { BlotterConfigurationItem } from "./BlotterConfiguration";

export interface IBlotterClone {
  refKey: string;
  id: string;
  clonedFromId: string;
  name: string;
  title: string;
  datasetView: string;
  parent: string;
  description: string;
  config?: BlotterConfigurationItem;
}
