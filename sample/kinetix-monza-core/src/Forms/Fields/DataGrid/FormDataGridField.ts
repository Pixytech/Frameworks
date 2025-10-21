import { GridColumnProps, GridExpandChangeEvent, GridHeaderSelectionChangeEvent, GridSelectionChangeEvent, getSelectedState } from "@progress/kendo-react-grid";
import { FormField } from "../FormField";
import { Observable, Subject } from "rxjs";
import { FormModel } from "../../FormModel";
import { IFormViewModel } from "../../IFormViewModel";
import { DataGridModel } from "./DataGridModel";
import { SelectionSettings } from "../../../Data";
import { DATA_ITEM_KEY, EDIT_FIELD, idGetter } from "../../../Blotter/Utils/constants";
import { State } from "@progress/kendo-data-query";


export interface IFormDataGridDraggableContext {
  enable: boolean;
  activeDragItem?: any;
  reorder(item: any): void;
  dragEnd(): void;
}

export class FormDataGridField extends FormField<DataGridModel> {
  selectionSettings: SelectionSettings = new SelectionSettings();
  draggable: IFormDataGridDraggableContext;

  private readonly selecteditemSubject: Subject<any[]> = new Subject<any[]>();
  public readonly onSelectedItemChanged: Observable<any[]>;

  private readonly rowClickitemSubject: Subject<any> = new Subject<any>();
  public readonly onRowClicked: Observable<any>;

  public readonly type: string = "FormDataGridField";

  constructor(owner?: IFormViewModel<FormModel>) {
    super(owner);

    this.onSelectedItemChanged = this.selecteditemSubject.asObservable();
    this.onRowClicked = this.rowClickitemSubject.asObservable();
  }

  protected createModel(): DataGridModel {
    return new DataGridModel([]);
  }
  columns: GridColumnProps[] = [];

  public raiseSelectionChange(dataItem: any) {
    this.selecteditemSubject.next(dataItem);
  }

  rowClicked(dataItem: any) {
    this.rowClickitemSubject.next(dataItem);
  }

  exitEdit = () => {
    const newData = this.model.value.map((item) => ({
      ...item,
      [EDIT_FIELD]: undefined,
    }));
    this.updateModel((m) => (m.value = newData));
  };

  enterEdit = (dataItem: any, fieldName: string | undefined) => {
    const currentColumn = this.columns.find((x) => x.field == fieldName);
    if (currentColumn && currentColumn.editable) {
      const fieldId = idGetter(dataItem);
      const newData = this.model.value.map((item) => ({
        ...item,
        [EDIT_FIELD]: idGetter(item) === fieldId ? fieldName : undefined,
      }));

      this.updateModel((m) => (m.value = newData));
    }
  };

  itemChange = (name: string | undefined, dataItem: any, value: any) => {
    let fieldName = name || "";
    const fieldId = idGetter(dataItem);
    let newData = this.model.value.map((item) => {
      if (idGetter(item) === fieldId) {
        item[fieldName] = value;
      }
      return item;
    });
    this.updateModel((m) => (m.value = newData));
  };

  selectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: this.model.selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    this.updateModel((model) => (model.selectedState = newSelectedState));
    this.raiseSelectionChange(event.dataItem);
  };

  async dataStateChange(state: State): Promise<void>{
    this.updateModel((model) => (model.state = state));
    console.debug("grid state changed", this.model.state);
    this.notifyModelChanged();
  }

  expandChange = (e: GridExpandChangeEvent) => {
    const dataItem = e.dataItem;
    const expanded = e.value;
    if (dataItem.groupId) {
      const collapsedIds = !expanded ? [...this.model.collapsedState, dataItem.groupId] : this.model.collapsedState.filter((groupId) => groupId !== dataItem.groupId);
      this.updateModel((model) => (model.collapsedState = collapsedIds));
    } else {
      const fieldId = idGetter(dataItem);
      const detailedRowExpansionIds = expanded ? [...this.model.detailedRowExpandState, fieldId] : [...this.model.detailedRowExpandState.filter((id) => id !== fieldId)];
      this.updateModel((model) => (model.detailedRowExpandState = detailedRowExpansionIds));
    }
  };

  headerSelectionChange = (event: GridHeaderSelectionChangeEvent) => {
    const checkboxElement: any = event.syntheticEvent.target;
    const checked = checkboxElement.checked;
    const newSelectedState: { [id: string]: boolean | number[] } = {};

    this.model.items.forEach((item) => {
      newSelectedState[idGetter(item)] = checked === true;
    });

    this.updateModel((model) => (model.selectedState = newSelectedState));
  };
}
