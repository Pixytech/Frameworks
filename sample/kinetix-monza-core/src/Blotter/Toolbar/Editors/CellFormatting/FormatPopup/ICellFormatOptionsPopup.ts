import { IViewModelBase } from "@kinetix/core";
import {
  IBlotterCellFormatOptions,
  IBlotterCellFormatRowGroup,
} from "../../../..";

import { BlotterCellFormatOptionsPopupModel } from "./CellFormatOptionsPopupModel";

export const IBlotterCellFormatOptionsPopupType = Symbol.for(
  "IBlotterCellFormatOptionsPopup"
);
export interface IBlotterCellFormatOptionsPopup
  extends IViewModelBase<BlotterCellFormatOptionsPopupModel> {
  Owner: IBlotterCellFormatRowGroup;
  column: string;
  formats?: IBlotterCellFormatOptions;
  showPopup(): void;
  closePopup(): void;
  handleDelete(): void;
  handleColorTabChange(selectedTab: number): void;
  toggleTextBold(): void;
  toggleTextItalics(): void;
  toggleTextUnderline(): void;
  toggleTextStrikethrough(): void;
  handleTextTextColorChange(color: string): void;
  handleBgColorChange(color: string): void;
  handleApplyToEntireRowChange(value: boolean): void;
}
