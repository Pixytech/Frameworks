import { FormField } from "../FormField";
import { FieldModelBase } from "../FieldModelBase";
import { cloneDeep, debounce, get, set } from "lodash";

import { MultiColumnComboBoxColumn } from "@progress/kendo-react-dropdowns";
import { debounceWithResults, using } from "@kinetix/core";
import { ChipProps } from "@progress/kendo-react-buttons";
import { DataFilter, DataTypes } from "../../../Data";
import { dataService } from "../../../Utils/blotterApi";
import { AcceleratorModel } from "../AccelaratorModel";
import { UpdateSourceTrigger } from "../UpdateSourceTrigger";
import { expandedState, processMultiSelectTreeData } from "./MultiSelectTreeDataOperations";

export type DropDownType = "ChipList" | "DropDownList" | "DropDownTree" | "MultiColumnComboBox" | "RadioButtonList";

export type AutoCompleteSelection = "Single" | "Multiple";

export class AutoCompleteModel extends FieldModelBase {
  data: any[] = [];
  ignoreOptions: string[] = [];
  options: any[] = [];
  loading: boolean = false;
  text: string;
  chips: ChipProps[] = [];
  acceleratorData: any[] = [];
  public show: boolean = false;
  tooltip: string = "Choose an option";
  filter?: DataFilter | null;
  expandState: any[] = [];
}
export class FormAutoCompleteField extends FormField<AutoCompleteModel> {
  dropDown?: DropDownType;
  clearButton: boolean;
  selection: AutoCompleteSelection = "Single";
  filterable: boolean = false;
  public EnableAcelerator: boolean = false;

  public readonly type: string = "FormAutoCompleteField";
  public AcceleratorList: AcceleratorModel[] = [new AcceleratorModel("2YR", "2y"), new AcceleratorModel("3YR", "3y"), new AcceleratorModel("5YR", "5y"), new AcceleratorModel("7YR", "7y"), new AcceleratorModel("10YR", "10y"), new AcceleratorModel("20YR", "20y"), new AcceleratorModel("30YR", "30y")];
  initialDataLoaded: boolean = false;

  protected createModel(): AutoCompleteModel {
    const model = new AutoCompleteModel();
    this.updateSourceTrigger = UpdateSourceTrigger.PropertyChanged;

    return model;
  }

  displayName: string = "displayName";
  dataItemKey: string = "id";
  checkField: string = "checkField";
  checkIndeterminateField: string = "checkIndeterminateField";
  subItemsField: string = "items";
  expandField: string = "expanded";
  dataset?: string;
  allowCustom: boolean = true;

  filterServerData?(data: any[]): any[];
  columns: MultiColumnComboBoxColumn[] = [];

  public onExpandChange(item: any) {
    this.updateModel((x) => (x.expandState = expandedState(item, "id", this.model.expandState)));
  }

  public getTreeOptions(): any {
    const fields = {
      dataItemKey: this.dataItemKey,
      checkField: this.checkField,
      checkIndeterminateField: this.checkIndeterminateField,
      expandField: this.expandField,
      subItemsField: this.subItemsField,
    };
    const data = this.getOptions();
    const treeData = processMultiSelectTreeData(data, { expanded: this.model.expandState, value: this.value, filter: this.model.filter, ...fields });
    return treeData;
  }

  public getOptions(): any[] {
    if (this.dataset) {
      return this.model.data;
    } else {
      // if filter is set then provide from data else full list
      const availableOptions = this.model.text ? this.model.data : this.model.options;

      if (this.model.ignoreOptions.length > 0) {
        return availableOptions.filter((x) => {
          const displayValue = get(x, this.displayName, "");

          const includesValue = this.model.ignoreOptions.some((element) => {
            return element.toLowerCase() === displayValue.toLowerCase();
          });

          return !includesValue;
        });
      } else {
        return availableOptions;
      }
    }
  }

  handleTabKey = (e: React.KeyboardEvent<Element>) => {
    if (!e.shiftKey && !this.model.loading) {
      if ((!this.model.value || this.model.value.length == 0) && this.model.text) {
        if (this.model.data && this.model.data.length > 0) {
          using(this.SuspendNotifications(), () => {
            this.updateModel((m) => (m.text = ""));
            this.setValue(this.model.data[0]);
            if (this.model.required) this.Owner?.moveToNextField(this.renderIndex);
          });
        }
      }
    }

    super.onKeyDown(e);
  };

  onFocus(): void {
    console.debug(`[FormAutoComplete] onFocus called - dataset: ${this.dataset}, data length: ${this.model.data.length}, loading: ${this.model.loading}`);
    super.onFocus();
    
    // Load data when focused if using a dataset and not already loaded
    if (this.dataset && this.model.data.length === 0 && !this.model.loading) {
      console.debug(`[FormAutoComplete] Loading data on focus for dataset: ${this.dataset}`);
      this.fetachData(undefined);
    }
  }

  onKeyDown(e: React.KeyboardEvent<Element>): void {
    if (e.key === "Tab") {
      this.handleTabKey(e);
    } else if (this.EnableAcelerator && e.ctrlKey && e.key === "ArrowDown") {
      e.preventDefault();
      e.stopPropagation();
      this.handleAcceleratorPopup(true);
    } else {
      super.onKeyDown(e);
    }
  }

  public async filterData (filter: DataFilter): Promise<void> {
    console.debug(`[FormAutoComplete] filterData called - filter:`, filter, `hasFocus: ${this.hasfocus}, readonly: ${this.model.readonly}, dataset: ${this.dataset}`);
    if (!this.hasfocus || this.model.readonly || this.Owner?.model.readonly) {
      console.debug(`[FormAutoComplete] filterData early return - hasFocus: ${this.hasfocus}, readonly: ${this.model.readonly}, owner readonly: ${this.Owner?.model.readonly}`);
      return;
    }

    this.updateModel((x) => {
      x.loading = true;
      x.text = filter.value;
      x.filter = filter;
    });
    if (this.dataset) {
      console.debug(`[FormAutoComplete] filterData calling fetachData for dataset: ${this.dataset}`);
      await this.fetachData(filter.value);
    } else {
      console.debug(`[FormAutoComplete] filterData using local options (no dataset)`);
      this.updateModel((model) => {
        model.data = filter.value ? this.getOptions().filter((option) => get<string>(option, this.displayName, "").toLowerCase().includes(`${filter.value}`.toLowerCase())) : this.getOptions();
        model.loading = false;
      });
    }
  };

  async fetachData(value: string | undefined): Promise<void> 
    {
      console.debug(`[FormAutoComplete] fetachData called for dataset: ${this.dataset}, value: ${value}`);
      await this.fetachDataInternal(value)
    }

  fetachDataInternal = debounceWithResults((value: string | undefined)=> {
    if (this.dataset) {
      console.debug(`[FormAutoComplete] fetachDataInternal executing API call for dataset: ${this.dataset}, value: ${value}`);
      this.updateModel((x) => (x.loading = true));
      dataService
        .getDatasetDataByLookup(this.dataset, value)
        .then((res) => {
          console.debug(`[FormAutoComplete] API response for dataset ${this.dataset}:`, res);
          this.updateModel((x) => {
            x.loading = false;
            if (res.items?.length) {
              // some items does not have display name so add default
              let items = this.filterServerData ? this.filterServerData(res.items) : res.items;
              x.data = items.map((x: any) => {
                set(x, this.displayName, get(x, this.displayName, ""));
                return x;
              });
              console.debug(`[FormAutoComplete] Loaded ${x.data.length} items for dataset ${this.dataset}`);
            } else {
              x.data = [];
              console.debug(`[FormAutoComplete] No items returned for dataset ${this.dataset}`);
            }

            if (!this.hasfocus) {
              if (!x.value && x.text) {
                if (x.data && x.data.length > 0) {
                  this.setValue(x.data[0]);
                }
              }
            }
          });
        })
        .catch((error) => {
          console.error(`[FormAutoComplete] Error loading dataset ${this.dataset}:`, error);
          this.updateModel((x) => {
            x.loading = false;
            x.data = [];
          });
        })
        .finally(() => {
          this.updateModel((x) => (x.loading = false));
        });
    } else {
      console.debug(`[FormAutoComplete] No dataset configured, skipping API call`);
    }
  },400);

  setMetaData(fieldMeta: any): void {
    this.model.options = get(cloneDeep(fieldMeta), "options", []);
    this.model.data = this.model.options;
    super.setMetaData(cloneDeep(fieldMeta));
  }

  public get value(): any {
    if (this.model.value === null || this.model.value === undefined) {
      return this.selection == "Multiple" ? [] : this.model.value;
    }
    return this.model.value;
  }

  public set value(fieldValue: any) {
    super.setValue(fieldValue);
  }

  private searchExistingItems(value: any) {
    if (this.dropDown === "DropDownTree") {
      return value;
    }
    const existingItems = this.getOptions();
    const searchContext = Array.isArray(value) ? value : [value];

    const items = searchContext
      .map((search) => {
        //search by string in display or value
        let fieldValue = existingItems.find((x: any) => get(x, this.displayName, "") === search || x.value === search);
        if (!fieldValue) {
          //search by complex type
          fieldValue = existingItems.find((x: any) => get(x, this.displayName, "") === get(search, this.displayName, "different"));
        }
        return fieldValue;
      })
      .filter((x) => x != undefined);

    return this.selection == "Multiple" ? items : items.find((v, i) => i === 0);
  }

  public setValue(value: any): void {
    let fieldValue = value;
    try {
      if (value === null || value === undefined) {
        fieldValue = this.selection == "Multiple" ? [] : value;
        return;
      }

      //search by string in display or value
      fieldValue = this.searchExistingItems(value);
      const hasValue = this.selection == "Multiple" ? fieldValue.length > 0 : fieldValue !== undefined;
      if (!hasValue) {
        const newValue = Array.isArray(value) ? value : [value];
        const result = newValue.map((item) => {
          const isComplexValue = typeof item == "object";
          if (isComplexValue) {
            return item;
          }
          const complexObject = {};
          set(complexObject, this.displayName, item);
          set(complexObject, "value", item);
          return complexObject;
        });
        fieldValue = this.selection == "Multiple" ? result : result.find((x, i) => i === 0);
      }
    } finally {
      super.setValue(fieldValue);
      // clear the filter after value set
      this.model.text = "";
      this.model.tooltip = this.getTitleTip();
    }
  }

  getTitleTip = (): string => {
    if (this.model.value && Array.isArray(this.model.value)) {
      if (this.model.value.length > 0) {
        return this.value.map((m: any) => {
          return get(m, this.displayName, undefined);
        });
      } else {
        return "Choose an option";
      }
    }
    return get(this.model.value, this.displayName, "Choose an option");
  };

  public buttonGroupKeydown(e: any, ElementRef: any, listRef: any): void {
    const childNodes = ElementRef.current._element.childNodes;
    const listNodes = listRef.current._element.childNodes;
    //@ts-ignore
    const activeIndex = document.activeElement.tabIndex;
    if (e.key === "ArrowRight") {
      if (childNodes[activeIndex + 1]) childNodes[activeIndex + 1].focus();
      else childNodes[0].focus();
    } else if (e.key === "ArrowLeft") {
      if (activeIndex > 0) childNodes[activeIndex - 1].focus();
    } else if (e.key === "ArrowUp" || e.key === "Escape") {
      this.handleAcceleratorPopup(false);
      this.focus();
      return;
    } else if (e.key === "ArrowDown") {
      if (listNodes[activeIndex] && listNodes[activeIndex + 1]) listNodes[activeIndex + 1].focus();
      else listNodes[0].focus();
    }
  }
  public filterAcceleratorData(val: string): void {
    dataService.getDatasetDataByLookup(this.dataset, val).then((res) => {
      this.updateModel((x) => {
        if (res.items?.length) {
          // some items does not have display name so add default
          const data = res.items.map((x: any) => {
            set(x, this.displayName, get(x, this.displayName, ""));
            return x;
          });
          x.acceleratorData = data[0] ? [data[0]] : [];
          this.handleAccelerator(data[0]);
        } else {
          x.acceleratorData = [];
          this.handleAccelerator();
        }
      });
    });
  }
  public handleAccelerator(fieldValue?: any): void {
    using(this.SuspendNotifications(), () => {
      if (fieldValue) {
        this.setValue(fieldValue);
        this.updateModel((x) => {
          x.show = false;
        });
      }
    });

    this.notifyModelChanged();
    setTimeout(() => this.focus(), 200);
  }

  public handleAcceleratorPopup = (toggle: boolean) => {
    if (!toggle) this.model.acceleratorData = [];
    using(this.SuspendNotifications(), () => {
      this.setValue(this.value);
      this.updateModel((x) => (x.show = toggle));
    });
    this.notifyModelChanged();
  };

  getSubmitValue() {
    switch (this.fieldType) {
      case DataTypes.enum:
      case DataTypes.list:
      case DataTypes.string:
        if (this.selection == "Multiple") {
          const data = Array.from(this.model.value ? this.model.value : []);
          return data.map((v) => get(v, this.displayName, v));
        }
        return get(this.model.value, this.displayName, this.model.value);
      default:
        return this.model.value;
    }
  }
}
