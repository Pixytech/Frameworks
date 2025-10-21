import { CoreTypes, IocInject, ViewModelBase } from "@kinetix/core";
import type { IContainer } from "@kinetix/core";
import { FilterOperator as Operator } from "@progress/kendo-react-data-tools";
import { isDate } from "lodash";
import {
  BlotterCellFormatRowGroupModel,
  IBlotterCellFormatOptionsPopup,
  IBlotterCellFormatOptionsPopupType,
  IBlotterCellFormatRowGroup,
  IBlotterCellFormatting,
} from "../..";
import { BlotterColumnDefinition } from "../../../..";
import { IBlotterCellFormatCondition } from "../../../../BlotterConfiguration";
import dayjs from "dayjs";

export class BlotterCellFormatRowGroupViewModel
  extends ViewModelBase<BlotterCellFormatRowGroupModel>
  implements IBlotterCellFormatRowGroup
{
  Owner: IBlotterCellFormatting;
  columns: BlotterColumnDefinition[];
  formatOptionsPopupViewModels: IBlotterCellFormatOptionsPopup[] = [];
  protected readonly iocBuilder: IContainer;

  constructor(@IocInject(CoreTypes.IContainer) builder: IContainer) {
    super();
    this.iocBuilder = builder;
  }
  configurationChanged(): void {
    this.Owner.configurationChanged();
  }

  protected createModel(): BlotterCellFormatRowGroupModel {
    return new BlotterCellFormatRowGroupModel();
  }

  protected async onInitializeOnce(): Promise<void> {
    console.debug("Init RowGroup", this.model.format);
    if (
      this.model.format &&
      this.formatOptionsPopupViewModels?.length !==
        this.model.format.conditions?.length
    ) {
      this.formatOptionsPopupViewModels = [];
      this.model.format.conditions.forEach((cond) => {
        let optionsPopup =
          this.iocBuilder.build<IBlotterCellFormatOptionsPopup>(
            IBlotterCellFormatOptionsPopupType
          );
        optionsPopup.Owner = this;
        optionsPopup.updateModel((model) => (model.formats = cond.format!));
        this.formatOptionsPopupViewModels.push(optionsPopup);
      });
      this.notifyModelChanged();
    }
  }
  createFormatOptionsPopup = (
    formatCondition: IBlotterCellFormatCondition
  ): IBlotterCellFormatOptionsPopup => {
    let optionsPopup = this.iocBuilder.build<IBlotterCellFormatOptionsPopup>(
      IBlotterCellFormatOptionsPopupType
    );

    optionsPopup.Owner = this;
    optionsPopup.updateModel(
      (model) => (model.formats = formatCondition.format!)
    );
    return optionsPopup;
  };

  handleOperatorChange = (operator: Operator, rowIndex: number) => {
    console.debug("operator changed", operator, rowIndex);
    const condition = this.model.format.conditions[rowIndex];

    if (condition) {
      this.updateModel(
        (model) => (model.format.conditions[rowIndex].opretaor = operator)
      );
    }
    this.configurationChanged();
  };

  handleValueChange = (value: any, rowIndex: number) => {
    if (value && value.displayName && value.value === undefined) {
      value = { ...value, value: value.displayName };
    }

    console.debug("Value changed", value);
    const condition = this.model.format.conditions[rowIndex];

    if (isDate(value)) {
      value = dayjs(value).format("YYYY-MM-DD");
    }

    if (condition) {
      this.updateModel(
        (model) => (model.format.conditions[rowIndex].value = value)
      );
    }
    this.configurationChanged();
  };

  handleDeleteRow = (rowIndex: number): void => {
    this.updateModel((model) => model.format.conditions.splice(rowIndex, 1));
    this.configurationChanged();
  };
}
