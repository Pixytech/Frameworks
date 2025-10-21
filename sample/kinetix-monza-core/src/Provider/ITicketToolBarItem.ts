import { ConfigurationItem } from "@kinetix/core";
import { TicketData } from "../TicketData";
import { BlotterData } from "../BlotterData";

export interface ITicketToolBarItem {
  Name: string;
  Catagory: string;
  Type: "Blotter" | "Ticket";
  Icon: string;
  Title?: string;
  Data: TicketData | BlotterData;
  Enabled?: boolean;
  Visible: boolean;
}

export class ToolbarItemConfigurationItem extends ConfigurationItem<ITicketToolBarItem[]> {}
