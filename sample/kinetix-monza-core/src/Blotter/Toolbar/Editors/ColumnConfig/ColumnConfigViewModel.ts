import { IocInjectable, ViewModelBase } from "@kinetix/core";
import { ListBoxItemClickEvent, ListBoxDragEvent, processListBoxDragAndDrop } from "@progress/kendo-react-listbox";
import { Observable, Subject } from "rxjs";
import { BlotterColumnDefinition, IDatasetView, IDatasetDefinition, IColumnConfig } from "../../..";
import { FormTextField, FormBooleanField } from "../../../../Forms";

import { IConfigurationEditor } from "../IConfigurationEditor";
import { BlotterColumnConfigModel, IColumnListItemData } from "./BlotterColumnConfigModel";
import { IBlotterColumnConfig } from "./IBlotterColumnConfig";

@IocInjectable()
export class BlotterColumnConfigViewModel extends ViewModelBase<BlotterColumnConfigModel> implements IBlotterColumnConfig {
  get onConfigurationChanged(): Observable<void> {
    return this.configurationSubject;
  }
  private readonly configurationSubject: Subject<void> = new Subject<void>();
  Owner: IConfigurationEditor;
  searchColumns: FormTextField = new FormTextField();
  selectAllColumns: FormBooleanField = new FormBooleanField();
  columns: BlotterColumnDefinition[] = [];
  activeColumns: string[] = [];

  protected createModel(): BlotterColumnConfigModel {
    return new BlotterColumnConfigModel();
  }

  protected async onInitializeOnce(): Promise<void> {
    this.selectAllColumns.onModelChanged.subscribe((x) => {
      this.updateModel(
        (model) =>
          (model.columns = model.columns.map((col) => {
            col.selected = x.value;
            return col;
          }))
      );
      this.configurationSubject.next();
    });
    this.searchColumns.onModelChanged.subscribe((x) => {
      this.updateModel((m) => (m.searchString = x.value));
    });
  }

  handleListItemClick = (event: ListBoxItemClickEvent): void => {
    this.updateModel((model) => {
      model.columns = model.columns.map((item: IColumnListItemData) => {
        if (item.name === event.dataItem.name) {
          item.selected = !item.selected;
        }
        return item;
      });
    });
    this.configurationSubject.next();
  };

  handleListItemDragStart = (e: ListBoxDragEvent): void => {
    this.updateModel((model) => (model.draggedItem = e.dataItem));
  };

  handleListItemDrop = (e: ListBoxDragEvent): void => {
    let result: any = processListBoxDragAndDrop(this.model.columns, this.model.columns, this.model.draggedItem, e.dataItem, "name");

    this.updateModel((model) => (model.columns = result.listBoxOneData));
    this.configurationSubject.next();
  };

  getFilteredColumns = (): IColumnListItemData[] => {
    if (this.model.columns) {
      return this.model.columns.filter((col) => col.name.toLocaleLowerCase().includes(this.model.searchString.toLocaleLowerCase()));
    }
    return [];
  };

  setConfiguration = (datasetView: IDatasetView, datasetDefinition: IDatasetDefinition, columnConfigs: IColumnConfig[]) => {
    this.columns = datasetView.columns
      .filter((x) => !x.hidden)
      .map((col) => {
        const columnDef = datasetDefinition.columns.find((x) => x.name === col.name);
        return columnDef!;
      });

    const columns = this.columns
      .filter((x) => x != undefined)
      .map((colDef) => {
        let col: IColumnListItemData = {
          name: colDef.name,
          displayName: colDef.displayName,
          type: colDef.type,
          selected: false,
          order: 0,
        };

        const config = columnConfigs ? columnConfigs!.find((x) => x.name === col.name) : undefined;

        if (config) {
          col.order = config.order!;
          col.selected = !config.hidden!;
        }

        return col;
      });

    this.updateModel((model) => (model.columns = columns.sort((x, y) => x.order! - y.order!)));
  };
}
