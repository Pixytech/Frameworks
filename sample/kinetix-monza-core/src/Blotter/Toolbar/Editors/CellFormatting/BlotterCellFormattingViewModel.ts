import { CoreTypes, IocInject, IocInjectable, ViewModelBase } from "@kinetix/core";
import type { IContainer } from "@kinetix/core";
import { FieldSettings } from "@progress/kendo-react-data-tools";
import { IBlotterCellFormatOptionsPopup, IBlotterCellFormatOptionsPopupType, IConfigurationEditor, getFieldSettings } from "..";
import { BlotterCellFormattingModel } from "./CellFormattingModel";
import { IBlotterCellFormatRowGroup, IBlotterCellFormatRowGroupType } from "./FormatRowGroup";
import { IBlotterCellFormatting } from "./ICellFormatting";
import { BlotterColumnDefinition } from "../../..";
import { FormAutoCompleteField } from "../../../../Forms";
import { GridOperationModes, IBlotterCellFormat, IBlotterCellFormatCondition } from "../../../BlotterConfiguration";
import { Observable, Subject } from "rxjs";
import { getOperatorsByType } from "../../../Utils/Operators";

@IocInjectable()
export class BlotterCellFormattingViewModel extends ViewModelBase<BlotterCellFormattingModel> implements IBlotterCellFormatting {
  get onConfigurationChanged(): Observable<void> {
    return this.configurationSubject;
  }
  private readonly configurationSubject: Subject<void> = new Subject<void>();
  searchColumn: FormAutoCompleteField = new FormAutoCompleteField();
  columns: BlotterColumnDefinition[] = [];
  formats: IBlotterCellFormat[] = [];

  formatGroups: IBlotterCellFormatRowGroup[] = [];

  protected readonly iocBuilder: IContainer;

  constructor(@IocInject(CoreTypes.IContainer) builder: IContainer) {
    super();
    this.iocBuilder = builder;
  }
  configurationChanged(): void {
    this.configurationSubject.next();
  }

  Owner: IConfigurationEditor;

  protected createModel(): BlotterCellFormattingModel {
    return new BlotterCellFormattingModel();
  }

  protected async onInitializeOnce(): Promise<void> {
    let sortedColumns = [...this.columns];
    sortedColumns.sort((colA, colB) => colA.displayName.localeCompare(colB.displayName));

    this.searchColumn.model.options = sortedColumns;
    this.searchColumn.model.data = sortedColumns;
    this.searchColumn.onModelChanged.subscribe((x) => {
      if (x.value) {
        this.handleColumnListItemClick(x.value);
      }
    });
  }

  mapFieldSettingsFromColumn = (column: BlotterColumnDefinition): FieldSettings => {
    return getFieldSettings(column);
  };

  getFilteredColumns = (): BlotterColumnDefinition[] => {
    if (this.columns && this.searchColumn.value) {
      return this.columns.filter((col) => col.displayName.toLocaleLowerCase().includes(this.searchColumn.value.toLocaleLowerCase()));
    }
    return [];
  };

  handleColumnListItemClick = (column: BlotterColumnDefinition): void => {
    const index = this.formatGroups?.findIndex((f) => f.model.format.column.name == column.name);
    if (index >= 0) {
      let formatGroupVm = this.formatGroups[index];

      let newFormatCondition: IBlotterCellFormatCondition = {
        opretaor: getOperatorsByType(column.type)[0],
        priority: 1,
        format: { textStyles: {} },
      };

      formatGroupVm.updateModel((model) => model.format.conditions.push(newFormatCondition));

      let optionsPopup = this.iocBuilder.build<IBlotterCellFormatOptionsPopup>(IBlotterCellFormatOptionsPopupType);
      optionsPopup.updateModel((model) => (model.formats = newFormatCondition.format!));
      formatGroupVm.formatOptionsPopupViewModels.push(optionsPopup);
    } else {
      let newFormat: IBlotterCellFormat = {
        column: column,
        conditions: [],
        priority: 1,
      };

      const newFormatCondition: IBlotterCellFormatCondition = {
        opretaor: getOperatorsByType(column.type)[0],
        priority: 1,
        format: { textStyles: {} },
      };

      newFormat.conditions.push(newFormatCondition);

      const newGroupVm = this.iocBuilder.build<IBlotterCellFormatRowGroup>(IBlotterCellFormatRowGroupType);

      newGroupVm.Owner = this;
      newGroupVm.columns = this.columns;
      newGroupVm.updateModel((model) => (model.format = newFormat));

      let optionsPopup = this.iocBuilder.build<IBlotterCellFormatOptionsPopup>(IBlotterCellFormatOptionsPopupType);
      optionsPopup.Owner = newGroupVm;
      optionsPopup.updateModel((model) => (model.formats = newFormatCondition.format!));
      newGroupVm.formatOptionsPopupViewModels.push(optionsPopup);

      this.formatGroups.push(newGroupVm);
    }

    this.updateModel((model) => {
      this.searchColumn.updateModel((m) => {
        m.value = null;
        m.text = "";
      });
    });
    this.configurationChanged();
  };

  setConfiguration = (gridMode: GridOperationModes) => {
    this.formatGroups = [];
    this.updateModel((model) => {
      model.formats = this.formats;
      model.gridMode = gridMode;
    });

    this.formats.forEach((f) => {
      const formatGroup = this.iocBuilder.build<IBlotterCellFormatRowGroup>(IBlotterCellFormatRowGroupType);
      formatGroup.Owner = this;
      formatGroup.columns = this.columns;
      formatGroup.updateModel((model) => {
        model.format = f;
        model.gridMode = gridMode;
      });
      this.formatGroups.push(formatGroup);
    });

    this.notifyModelChanged();
  };
}
