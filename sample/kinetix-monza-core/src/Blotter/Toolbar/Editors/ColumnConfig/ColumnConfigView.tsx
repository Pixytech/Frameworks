import { Checkbox } from "@progress/kendo-react-inputs";
import { ListBox, ListBoxItemClickEvent } from "@progress/kendo-react-listbox";
import GripIcon from "../../../../resources/images/Grip.svg";
import "./ColumnConfigViewStyles.scss";
import { useViewModelInstance } from "@kinetix/core";
import { IBlotterColumnConfig } from "./IBlotterColumnConfig";
import { FormBoolean, FormText, UpdateSourceTrigger } from "../../../../Forms";
import { AutomationHelper } from "@kinetix/core";

export interface IBlotterColumnCofigViewProps {
  dataContext: IBlotterColumnConfig;
}

const ColumListItem = (props: any) => {
  let { dataItem, selected, ...others } = props;
  return (
    <li data-automationid={AutomationHelper.GetId(dataItem.displayName)} {...others} className="column-list-item">
      <img src={GripIcon} height="1rem" />
      <Checkbox className="checkbox" checked={dataItem.selected} />
      {dataItem.displayName}
    </li>
  );
};

export const BlotterColumnConfigView = ({ dataContext }: IBlotterColumnCofigViewProps) => {
  const vm = useViewModelInstance(dataContext);
  return (
    <div className="list-wrapper">
      <div className="top-bar">
        <FormBoolean col={1} label={"Select all"} dataContext={vm.selectAllColumns} />
        <div className="search-input">
          <FormText updateSourceTrigger={UpdateSourceTrigger.PropertyChanged} placeholder="+ Search columns" dataContext={vm.searchColumns} />
        </div>
      </div>

      <ListBox className="column-list" data={vm.getFilteredColumns()} textField="displayName" selectedField={"selected"} item={ColumListItem} onItemClick={(e: ListBoxItemClickEvent) => vm.handleListItemClick(e)} onDragStart={vm.handleListItemDragStart} onDrop={vm.handleListItemDrop} />
    </div>
  );
};
