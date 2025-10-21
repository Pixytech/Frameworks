import { TreeView, TreeViewExpandChangeEvent, TreeViewHandle, TreeViewProps } from "@progress/kendo-react-treeview";
import { BlotterColumnDefinition, BlotterContext, BlotterSelectionContext, DATA_ITEM_KEY, IBlotter, idGetter, SELECTED_FIELD } from ".";
import React, { useMemo } from "react";
import { AutomationHelper, RegionView, useViewModelInstance } from "@kinetix/core";
import { BlotterContextMenu } from "./ContextMenu/BlotterContextMenu";
import { TreeViewContextMenuEvent } from "@progress/kendo-react-treeview/events";
import { Offset } from "@progress/kendo-react-popup";
import { get } from "lodash";
import { ExcelExport } from "@progress/kendo-react-excel-export";

interface IBlotterTreeProps extends TreeViewProps {
  dataContext: IBlotter;
  showTreeLines?: boolean;
}

export const BlotterTreeView = React.forwardRef<TreeViewHandle, IBlotterTreeProps>((props: IBlotterTreeProps, ref) => {
  const dataContext = useViewModelInstance(props.dataContext);
  const treeData = dataContext.model.getTreeDataResult();

  const loadingPanel = (
    <div className="loading-panel">
      <div className="k-loading-mask">
        <span className="k-loading-text">{dataContext.model.busyText}</span>
        <div className="k-loading-image"></div>
        <div className="k-loading-color"></div>
      </div>
    </div>
  );

  const onExpandChange = (event: TreeViewExpandChangeEvent) => {
    const fieldId = event.itemHierarchicalIndex;
    const collapsed = dataContext.model.collapsedState.find((id) => id === fieldId) != undefined;
    const collapsedIds = collapsed ? dataContext.model.collapsedState.filter((id) => id !== fieldId) : [...dataContext.model.collapsedState, fieldId];
    dataContext.updateModel((x) => (x.collapsedState = collapsedIds));
    console.debug("onExpandChange", collapsedIds);
  };

  const onCheckChange = (event: TreeViewExpandChangeEvent) => {
    const fieldId = event.itemHierarchicalIndex;
    const checked = dataContext.model.checkedState.find((id) => id === fieldId) != undefined;
    const checkedState = !checked ? [...dataContext.model.checkedState, fieldId] : dataContext.model.checkedState.filter((id) => id !== fieldId);
    dataContext.updateModel((x) => (x.checkedState = checkedState));
  };

  const getSelection = async (items: any[], selectedState: { [id: string]: boolean | number[] }, columns: BlotterColumnDefinition[]): Promise<BlotterSelectionContext> => {
    let selectedRecords: Record<string, any> = [];
    let selectedCell: any[] = [];

    let selectedKeys = Object.keys(selectedState);
    let keys = selectedKeys.filter((key) => selectedState[key]);

    let activeCols = columns.map((x) => x.name);

    keys.forEach((key) => {
      selectedRecords[key] = items.find((x) => get(x, DATA_ITEM_KEY) === key);

      if (typeof selectedState[key] !== "boolean") {
        let selCell: any = {};
        (selectedState[key] as number[]).forEach((x) => {
          selCell[activeCols[x]] = selectedRecords[key][activeCols[x]];
        });
        selectedCell.push(selCell);
      }
    });

    let selectedItems = Object.values(selectedRecords);
    return { rows: selectedItems, cells: selectedCell };
  };

  const onContextMenu = async (e: TreeViewContextMenuEvent) => {
    e.nativeEvent.preventDefault();

    let columns, items: any[], datasetView, selectedState;

    // on right click if row is already selected dont do anything
    // else unselect rest of rows and select the current
    const selectedStateKey = idGetter(e.item);
    const isSelected = dataContext.model.selectedState[selectedStateKey];
    columns = dataContext.model.columns;
    items = dataContext.model.items;
    datasetView = dataContext.datasetView;
    selectedState = dataContext.model.selectedState;
    const selection = await getSelection(items, selectedState, columns);
    const offset: Offset = { left: e.nativeEvent.clientX, top: e.nativeEvent.clientY };
    await dataContext.contextMenu.onContextMenu(offset, dataContext.model.id || datasetView.id, datasetView.datasetID, selection);
  };

  const _exportToExcelCompRef = React.useRef<ExcelExport | null>(null);
  const handleExportToExcel = async () => {
    if (_exportToExcelCompRef.current !== null) {
      dataContext.updateModel((m) => (m.busyText = "Exporting data"));

      await dataContext.loadExportData();

      _exportToExcelCompRef.current.save(dataContext.model.exportItems);
    }
  };

  const [exportingToPdf, setExportingToPdf] = React.useState(false);

  const handleExportToPdf = () => {
    setExportingToPdf(true);
  };

  const gridContext = useMemo(() => {
    return {
      model: dataContext.model,
      datasetDefinition: dataContext.datasetDefinition,
      missingCellTemplate: undefined,
    };
  }, [dataContext.datasetDefinition, dataContext.model]);

  return (
    <div
      className="blotter"
      onKeyDown={
        !dataContext.model.showToolbar
          ? async (e) => {
              await dataContext.showOptions(e.altKey, e.key);
            }
          : undefined
      }
    >
      {dataContext.model.showToolbar && !dataContext.model.configuration.toolbarCollapsed && <RegionView viewModel={dataContext.toolbar} exportExcelHandler={handleExportToExcel} exportPdfHandler={handleExportToPdf} />}

      {dataContext.datasetView ? (
        <div className="grid-wrapper" data-automationid={AutomationHelper.GetId(`blotter-${dataContext.datasetView.name}`)}>
          {dataContext.datasetDefinition && (
            <React.Suspense fallback={loadingPanel}>
              <BlotterContext.Provider value={gridContext}>
                <BlotterContextMenu dataContext={dataContext.contextMenu} />
                <div className="blotter-grid-panel">
                  <TreeView
                    textField={"value"}
                    className={`blotter-tree ${props.showTreeLines ? "blotter-tree-with-lines" : ""} ${props?.className}`}
                    childrenField="items"
                    selectField={SELECTED_FIELD}
                    onCheckChange={onCheckChange}
                    onExpandChange={onExpandChange}
                    onContextMenu={onContextMenu}
                    onItemClick={(event) => {
                      dataContext.updateModel(
                        (x) =>
                          (x.selectedState = {
                            [event.itemHierarchicalIndex]: true,
                            [idGetter(event.item)]: true,
                          })
                      );
                      if (dataContext.onRowClick) {
                        dataContext.onRowClick(event.item);
                      }
                    }}
                    {...props}
                    data={treeData.data}
                  />
                </div>
              </BlotterContext.Provider>
            </React.Suspense>
          )}
        </div>
      ) : (
        loadingPanel
      )}
    </div>
  );
});
