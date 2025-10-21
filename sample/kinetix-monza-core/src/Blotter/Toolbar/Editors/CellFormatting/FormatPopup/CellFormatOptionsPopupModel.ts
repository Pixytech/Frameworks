import { IBlotterCellFormatOptions } from "../../../../BlotterConfiguration";

export class BlotterCellFormatOptionsPopupModel {
  isPopupVisible: boolean = false;
  formats: IBlotterCellFormatOptions = {
    textStyles: {},
  };
  selectedColorTab: number = 0;
}
