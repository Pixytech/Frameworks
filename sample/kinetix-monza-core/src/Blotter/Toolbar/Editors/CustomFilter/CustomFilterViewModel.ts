import { IocInjectable, ViewModelBase } from "@kinetix/core";
import { CompositeFilterDescriptor } from "@progress/kendo-data-query";
import { FilterOperator } from "@progress/kendo-react-data-tools";
import { Observable, Subject } from "rxjs";
import { BlotterColumnDefinition, GridOperationModes, getFieldSettings } from "../../..";
import { CompositeDataFilter, DataTypes, DataFilter, toCompositeDataFilter, DataFieldSettings, isValidFilter } from "../../../../Data";
import { FormAutoCompleteField } from "../../../../Forms";

import { getOperatorsByType } from "../../../Utils/Operators";
import { IConfigurationEditor } from "../IConfigurationEditor";

import { BlotterCustomFilterModel } from "./CustomFilterModel";
import { IBlotterCustomFilter } from "./IBlotterCustomFilter";

@IocInjectable()
export class BlotterCustomFilterViewModel extends ViewModelBase<BlotterCustomFilterModel> implements IBlotterCustomFilter {
  get onConfigurationChanged(): Observable<void> {
    return this.configurationSubject;
  }
  private readonly configurationSubject: Subject<void> = new Subject<void>();
  Owner: IConfigurationEditor;
  searchColumn: FormAutoCompleteField = new FormAutoCompleteField();
  columns: BlotterColumnDefinition[] = [];

  protected createModel(): BlotterCustomFilterModel {
    return new BlotterCustomFilterModel();
  }

  protected async onInitializeOnce(): Promise<void> {
    this.updateModel((model) => (model.fields = this.columns.map((col) => this.mapFieldSettingsFromColumn(col))));
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

  setConfiguration(filters: CompositeDataFilter, gridMode: GridOperationModes): void {
    this.updateModel((model) => {
      model.gridMode = gridMode;
      model.fields = this.columns ? this.columns.map((col) => this.mapFieldSettingsFromColumn(col)) : [];
      model.filters = filters ?? { logic: "and", filters: [] };
    });
  }

  handleFilterChange = (field: string, fieldType: DataTypes, operator: FilterOperator, value: any, oldField?: string): void => {
    let index = -1;
    const filters = this.model.filters.filters as DataFilter[];
    if (oldField) {
      index = filters?.findIndex((filter) => filter.field === oldField);
    } else {
      index = filters?.findIndex((filter) => filter.field === field);
    }
    if (index >= 0) {
      this.updateModel(
        (model) =>
          (model.filters.filters[index] = {
            field: field,
            type: fieldType,
            operator: operator.operator,
            value: value,
          })
      );
    } else {
      this.updateModel((model) =>
        model.filters.filters.push({
          field: field,
          type: fieldType,
          operator: operator.operator,
          value: value,
        })
      );
    }
    this.configurationSubject.next();
  };

  handleClientFilterChange = (filter: CompositeFilterDescriptor) => {
    const dataFilter: CompositeDataFilter = toCompositeDataFilter(filter, (field: string, _value?: any) => {
      const col = this.columns.find((x) => x.name === field);

      return col ? col.type : DataTypes.string;
    });

    this.updateModel((model) => (model.filters = dataFilter));
    if (isValidFilter(dataFilter)) {
      this.configurationSubject.next();
    }
  };

  handleDeleteFilter = (field: string): void => {
    const filters = this.model.filters.filters as DataFilter[];
    const index = filters.findIndex((filter) => filter.field === field);
    if (index >= 0) {
      filters.splice(index, 1);
      this.updateModel((model) => (model.filters.filters = filters));
      this.configurationSubject.next();
    }
  };

  mapFieldSettingsFromColumn = (column: BlotterColumnDefinition): DataFieldSettings => {
    return getFieldSettings(column);
  };

  getFilteredColumns = (): BlotterColumnDefinition[] => {
    if (this.columns && this.searchColumn.value) {
      const filters = this.model.filters.filters as DataFilter[];
      return this.columns.filter((col) => `${col.displayName}`.toLocaleLowerCase().includes(`${this.searchColumn.value}`.toLocaleLowerCase()) && !filters.some((filter) => filter.field === col.name));
    }
    return [];
  };

  handleColumnListItemClick = (column: BlotterColumnDefinition): void => {
    const operators = getOperatorsByType(column.type);
    const defaultOperator = operators[0];

    const newFilter: DataFilter = {
      field: column.name,
      type: column.type,
      operator: defaultOperator.operator,
      ignoreCase: false,
    };

    this.updateModel((model) => {
      model.filters.filters.push(newFilter);
      this.searchColumn.updateModel((m) => {
        m.value = null;
        m.text = "";
      });
    });
    this.configurationSubject.next();
  };
}
