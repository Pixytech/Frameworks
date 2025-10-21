import { Filter, FilterOperator } from "@progress/kendo-react-data-tools";
import { useViewModelInstance } from "@kinetix/core";
import "./CustomFiltersViewStyles.scss";
import { IBlotterCustomFilter } from "./IBlotterCustomFilter";
import { BlotterFilterRow } from "./FilterRow";
import { DataFilter, toCompositeFilterDescriptor } from "../../../../Data";

import { getOperatorsByType } from "../../../Utils/Operators";
import { GridOperationModes } from "../../../BlotterConfiguration";
import { ConfigurationEditorSearchColumn } from "../ConfigurationEditorSearchColumn";

export interface IBlotterCustomFilterViewprops {
  dataContext: IBlotterCustomFilter;
}

export const BlotterCustomFiltersView = (props: IBlotterCustomFilterViewprops) => {
  const vm = useViewModelInstance(props.dataContext);

  const getFilterOperator = (field: string, operator: string | Function): FilterOperator => {
    const column = vm.columns.find((col) => col.name === field);
    const operators = getOperatorsByType(column?.type!);
    return operators.find((op) => op.operator === operator)!;
  };

  const kendoFilters = toCompositeFilterDescriptor(vm.model.filters);
  console.log("kendoFilters", kendoFilters);
  return vm.model.gridMode === GridOperationModes.Client ? (
    <div className="custom-filters">
      {vm.model.fields && (
        <Filter
          value={kendoFilters}
          onChange={(e) => {
            vm.handleClientFilterChange(e.filter);
          }}
          fields={vm.model.fields}
        />
      )}
    </div>
  ) : (
    <div className="custom-filters">
      {vm.model.fields && (
        <div className="search-container">
          <ConfigurationEditorSearchColumn dataContext={vm.searchColumn} />
        </div>
      )}
      {vm.model.filters.filters.length > 0 ? (
        <div className="filters-list">
          {vm.model.filters.filters.map((x) => {
            const filter = x as DataFilter;

            return <BlotterFilterRow key={filter.field?.toString()} columns={vm.columns} field={filter.field?.toString()!} operator={getFilterOperator(filter.field?.toString()!, filter.operator)} value={filter.value} onChange={vm.handleFilterChange} onDelete={vm.handleDeleteFilter} />;
          })}
        </div>
      ) : (
        <div className="empty">
          <h5 className="title">No custom filters created</h5>
          <p className="message">You can customise the default content presented in the blotter by applying custom filters. To do so use Search columns box above.</p>
        </div>
      )}
    </div>
  );
};
