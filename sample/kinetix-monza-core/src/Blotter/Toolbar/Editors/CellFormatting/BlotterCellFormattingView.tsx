import { RegionView, useViewModelInstance } from "@kinetix/core";
import "./BlotterCellFormattingViewStyles.scss";
import { IBlotterCellFormatting } from "./ICellFormatting";
import { ConfigurationEditorSearchColumn } from "../ConfigurationEditorSearchColumn";

export interface IBlotterCellFormattingViewProps {
  dataContext: IBlotterCellFormatting;
}

export const BlotterCellFormattingView = (props: IBlotterCellFormattingViewProps) => {
  const vm = useViewModelInstance(props.dataContext);

  return (
    <div className="custom-formats">
      <div className="search-container">
        <ConfigurationEditorSearchColumn dataContext={vm.searchColumn} />
      </div>
      <div className="groups">{vm.formatGroups.map((groupVm) => (groupVm.model.format?.column ? <RegionView key={groupVm.model.format.column.name} viewModel={groupVm} /> : <></>))}</div>
    </div>
  );
};
