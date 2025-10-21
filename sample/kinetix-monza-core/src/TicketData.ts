import { AssetType } from "./AssetType";
import { RecordType } from "./RecordType";

export interface PropertyModel {
  readonly fieldName: string;
  readonly value: any;
}

export interface TicketData {
  eventType: string;
  productType?: string;
  assetType: AssetType;
  recordType: RecordType;
  source: string;
  properties: PropertyModel[];
}
