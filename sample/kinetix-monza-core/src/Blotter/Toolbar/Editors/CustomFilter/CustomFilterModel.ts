import { CompositeDataFilter, DataFieldSettings } from "../../../../Data";
import { GridOperationModes } from "../../../BlotterConfiguration";

export class BlotterCustomFilterModel {
  filters: CompositeDataFilter = { logic: "and", filters: [] };
  fields: DataFieldSettings[];
  gridMode: GridOperationModes;
}
