import { IConfigurationId } from "@kinetix/core";
import { ITicketToolBarItem } from "./ITicketToolBarItem";

export interface IToolbarItemProvider {
  getToolbarItems(): Promise<ITicketToolBarItem[]>;
  saveToolbarItems(items: ITicketToolBarItem[]): Promise<void>;
  resetToolbars(): Promise<void>;
  ConfigurationId: IConfigurationId;
}
