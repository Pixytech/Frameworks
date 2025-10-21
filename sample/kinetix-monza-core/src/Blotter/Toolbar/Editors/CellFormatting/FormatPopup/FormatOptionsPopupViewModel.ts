import { ViewModelBase } from "@kinetix/core";
import { IBlotterCellFormatOptions } from "../../../../BlotterConfiguration";
import { IBlotterCellFormatRowGroup } from "../FormatRowGroup";
import { BlotterCellFormatOptionsPopupModel } from "./CellFormatOptionsPopupModel";
import { IBlotterCellFormatOptionsPopup } from "./ICellFormatOptionsPopup";

export class BlotterCellFormatOptionsPopupViewModel
  extends ViewModelBase<BlotterCellFormatOptionsPopupModel>
  implements IBlotterCellFormatOptionsPopup
{
  Owner: IBlotterCellFormatRowGroup;
  column: string;
  formats?: IBlotterCellFormatOptions | undefined;

  protected createModel(): BlotterCellFormatOptionsPopupModel {
    return new BlotterCellFormatOptionsPopupModel();
  }

  showPopup = () => {
    this.updateModel((model) => (model.isPopupVisible = true));
    console.debug("showPopup");
  };

  closePopup = () => {
    this.updateModel((model) => (model.isPopupVisible = false));
    console.debug("closePopup");
  };

  handleDelete = (): void => {
    this.updateModel(
      (model) =>
        (model.formats = {
          textStyles: {},
        })
    );
    this.Owner.configurationChanged();
  };

  handleColorTabChange = (selectedTab: number): void => {
    this.updateModel((model) => (model.selectedColorTab = selectedTab));
  };

  toggleTextBold = (): void => {
    this.updateModel(
      (model) =>
        (model.formats.textStyles.bold = !model.formats.textStyles.bold)
    );
    this.Owner.configurationChanged();
  };

  toggleTextItalics = (): void => {
    this.updateModel(
      (model) =>
        (model.formats.textStyles.italic = !model.formats.textStyles.italic)
    );
    this.Owner.configurationChanged();
  };

  toggleTextUnderline = (): void => {
    this.updateModel(
      (model) =>
        (model.formats.textStyles.underline =
          !model.formats.textStyles.underline)
    );
    this.Owner.configurationChanged();
  };

  toggleTextStrikethrough = (): void => {
    this.updateModel(
      (model) =>
        (model.formats.textStyles.strikethrough =
          !model.formats.textStyles.strikethrough)
    );
    this.Owner.configurationChanged();
  };

  handleTextTextColorChange = (color: string): void => {
    if (this.model.formats.textStyles?.textColor === color) {
      this.updateModel(
        (model) => (model.formats.textStyles.textColor = undefined)
      );
    } else {
      this.updateModel(
        (model) =>
          (model.formats.textStyles.textColor =
            color && color.length > 0 ? color : undefined)
      );
    }
    this.Owner.configurationChanged();
  };

  handleBgColorChange = (color: string): void => {
    if (this.model.formats.backgroundColor === color) {
      this.updateModel((model) => (model.formats.backgroundColor = undefined));
    } else {
      this.updateModel(
        (model) =>
          (model.formats.backgroundColor =
            color && color.length > 0 ? color : undefined)
      );
    }
    this.Owner.configurationChanged();
  };

  handleApplyToEntireRowChange = (value: boolean) => {
    this.updateModel(
      (model) => (model.formats.applyToRow = value ? value : undefined)
    );
    this.Owner.configurationChanged();
  };
}
