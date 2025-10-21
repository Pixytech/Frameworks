import { IViewModelBase } from "@kinetix/core";
import { ILayoutProvider } from "./ILayoutProvider";

export interface ITicket extends IViewModelBase<TicketModel> {
  ticketConfig: any;
  ticketData: any;
  layoutProvider: ILayoutProvider;
  layoutContext: { eventType: string; productType: string; isBulk: boolean };
  handleSubmit(dataItem: any): Promise<void>;
}

export class TicketModel {
  remoteValidationIssues: [];
  frontEndFields: any;
  initialData: any;
  fieldMeta: any;
  currentView: string = "/";
  selectedTab: number = 0;
  closeIcon: boolean | undefined;
  busyText: string;
  isSubmitting: boolean;
}
