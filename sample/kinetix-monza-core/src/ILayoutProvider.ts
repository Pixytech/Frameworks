import { AssetType } from "./AssetType";
import { RecordType } from "./RecordType";
import { TicketData } from "./TicketData";
export interface ILayoutProvider {
  assetType: AssetType;
  getLayoutType(data: Partial<TicketData>, isBulk: boolean): Promise<symbol | null>;
  getDataEndpoint(eventType: string, recordType: RecordType, productType: string): string;
  getIntentName(data: TicketData): string;
}
