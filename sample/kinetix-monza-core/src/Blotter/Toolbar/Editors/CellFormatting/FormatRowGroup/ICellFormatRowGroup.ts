import { IViewModelBase } from "@kinetix/core";
import {
  BlotterCellFormatRowGroupModel,
  IBlotterCellFormatOptionsPopup,
  IBlotterCellFormatting,
} from "../../..";
import { FilterOperator as Operator } from "@progress/kendo-react-data-tools";
import {
  BlotterColumnDefinition,
  IBlotterCellFormatCondition,
} from "../../../../..";

export const IBlotterCellFormatRowGroupType = Symbol.for(
  "IBlotterCellFormatRowGroup"
);
export interface IBlotterCellFormatRowGroup
  extends IViewModelBase<BlotterCellFormatRowGroupModel> {
  configurationChanged(): void;
  Owner: IBlotterCellFormatting;
  columns: BlotterColumnDefinition[];
  formatOptionsPopupViewModels: IBlotterCellFormatOptionsPopup[];

  handleOperatorChange(operator: Operator, rowIndex: number): void;
  handleValueChange(value: any, rowIndex: number): void;
  handleDeleteRow(rowIndex: number): void;
  createFormatOptionsPopup(
    formatCondition: IBlotterCellFormatCondition
  ): IBlotterCellFormatOptionsPopup;
}
