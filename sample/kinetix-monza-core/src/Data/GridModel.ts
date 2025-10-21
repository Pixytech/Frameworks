import { DataResult, State, process } from "@progress/kendo-data-query";
import { setExpandedState, setGroupIds } from "@progress/kendo-react-data-tools";
import { DATA_ITEM_KEY, EXPANDED_ROW, SELECTED_FIELD, idGetter } from "../Blotter/Utils/constants";
import { Helpers } from "../Utils/Helpers";
import { omit } from "lodash";
import { IViewModelBase } from "@kinetix/core";
import { Observable, Subject } from "rxjs";

interface TreeViewDataItem {
  expanded?: boolean;
  checked?: boolean;
  selected?: boolean;
  items?: TreeViewDataItem[];
  itemHierarchicalIndex :string;
}

export interface DataTreeResult {
  /**
   * The data that will be rendered by the Grid as an array.
   */
  data: TreeViewDataItem[];
  /**
   * The total number of records that are available.
   */
  total: number;
}

export class GridModel {
  public columnVirtualization?:boolean = undefined
  private _items: any[] = [];
  protected _state: State = { skip: 0, take: 20, sort: [], group: [] };
  primaryKeys?: string[];
  id: string = "";
  private _dataResult: DataResult = { data: [], total: 0 };
  private _treeDataResult: DataTreeResult ;
  private _selectedState: { [id: string]: boolean | number[] } = {};
  private _detailedRowExpandState: string[] = [];
  private _collapsedState: string[] = [];
  private _checkedState: string[] = [];
  
  private readonly _selectionUpdate = new Subject<void>();
  private isTreeViewModel :Boolean = false;
  onSelectionUpdate():Observable<void>{
    return this._selectionUpdate.asObservable();
  }
  get items(): any[] {
    return this._items;
  }

  set items(data: any[]) {
    
    const itemsWithKey = data
      ? data.map((item, index) => {
          const key = Helpers.getCompositeKey(item, index, this.primaryKeys);
          return Object.assign({ [SELECTED_FIELD]: this.selectedState[idGetter(item)], [EXPANDED_ROW]: this.detailedRowExpandState.includes(idGetter(item)), [DATA_ITEM_KEY]: key }, item);
        })
      : [];
    this._items = itemsWithKey;
    //console.debug(`Setting data items ${this.id}`,this._items,data);
    this.updateDataResult();
  }

  public getSelectedItems(): any[] {
    return this._items.filter((item) => this.selectedState[idGetter(item)] === true).map((item) => omit(item, [SELECTED_FIELD, EXPANDED_ROW, DATA_ITEM_KEY]));
  }
  public get state(): State {
    return this._state;
  }

  public set state(value: State) {
    this._state = value;
    this.updateDataResult();
  }

  private getTreeData(items:any[],parentId?:string):TreeViewDataItem[]{
    let selectedKeys = Object.keys(this._selectedState);
    let select = selectedKeys.filter((key) => this._selectedState[key]);
    

    return items.map((x:any,index:number)=>{
      const id= parentId?`${parentId}_${index}`:`${index}`;
      const node:TreeViewDataItem = {...x,
        itemHierarchicalIndex:id,
        DATA_ITEM_KEY:idGetter(x),
        expanded:!this._collapsedState.includes(id),
        selected:select.includes(id),
        checked:this._checkedState.includes(id),
        items:x.items?this.getTreeData(x.items,id):undefined
      } 
      return node;
    });

  }
  
  private processTreeDataResult(): DataTreeResult {
    const dataResult = this.getDataResult();
    const result = {total:dataResult.total,data:this.getTreeData(dataResult.data)};
    //console.debug(`onProcessData ${this.id}`,result);
    return result
  }

  public getTreeDataResult(): DataResult {
    this.isTreeViewModel = true;
    
    if(!this._treeDataResult){
      this.updateDataResult();
      this._treeDataResult = this.processTreeDataResult();
    }
    return this._treeDataResult;
  }

  public getDataResult(): DataResult {
    return this._dataResult;
  }
  private updateDataResult(): void {
    this._dataResult = this.onProcessData();
    //console.debug(`updateDataResult ${this.id}`,this._dataResult)
    this.updateSelection();

    setGroupIds({ data: this._dataResult.data, group: this.state.group });
    this.updateExapnsion();
   
  }

  protected onProcessData(): DataResult {
    const result = process(this.items ? this.items : [], this.state);
    //console.debug(`onProcessData ${this.id}`,result, this.items, this.state);
    return result; 
  }

  public get collapsedState(): string[] {
    return this._collapsedState;
  }

  public set collapsedState(value: string[]) {
    this._collapsedState = value;
    this.updateExapnsion();
  }

  public get checkedState(): string[] {
    return this._checkedState;
  }

  public set checkedState(value: string[]) {
    this._checkedState = value;
    this.updateExapnsion();
  }

  public get detailedRowExpandState(): string[] {
    return this._detailedRowExpandState;
  }

  public set detailedRowExpandState(value: string[]) {
    const isChanged = this._detailedRowExpandState != value;
    this._detailedRowExpandState = value;
    if(isChanged){
      this.detailedRowExapnsion();
    }
  }

  public get selectedState(): { [id: string]: boolean | number[] } {
    return this._selectedState;
  }

  public set selectedState(value: { [id: string]: boolean | number[] }) {
    this._selectedState = value;
    this.updateSelection();
  }

  private detailedRowExapnsion() {
    this.items = this._items.map((item) => ({
      ...item,
      [EXPANDED_ROW]: this.detailedRowExpandState.includes(idGetter(item)),
    }));
    console.debug(this._dataResult.data);
  }
  

  private updateSelection() {
    this._items = this._items.map((item) => {
      const id = idGetter(item);
      const isSelected = this.selectedState[id];
      
      return {
        ...item,
        [SELECTED_FIELD]: isSelected,
      };
     
    });

    this._dataResult = this.onProcessData();
    setGroupIds({ data: this._dataResult.data, group: this.state.group });
    if(this.isTreeViewModel){
      this._treeDataResult = this.processTreeDataResult();
    }
    this._selectionUpdate.next();
  }
  private updateExapnsion() {
    this._dataResult.data = setExpandedState({
      data: this._dataResult.data,
      collapsedIds: this.collapsedState,
    });
    if(this.isTreeViewModel){
      this._treeDataResult = this.processTreeDataResult();
      //console.debug(`updateExapnsion ${this.id}`,this._treeDataResult);
    }
  }
}

export enum SelectionMode {
  Single = "single",
  Multiple = "multiple",
}

export class SelectionSettings {
  enabled: boolean;
  drag: boolean;
  cell: boolean;
  mode: SelectionMode;
  headerSelection: boolean;
}

export interface IFilterData {
  text: string;
  value: any;
}

export class ListFilterModel {
  data: IFilterData[] = [];
}
export interface IListFilterDataProvider extends IViewModelBase<ListFilterModel> {
  refreshFilters(): Promise<void>;
}
