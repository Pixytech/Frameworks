import React, { ComponentType, useContext, useMemo } from "react";
import { Offset } from "@progress/kendo-react-popup";
import { getSelectedState, Grid, GridColumn, GridColumnReorderEvent, GridColumnResizeEvent, GridDataStateChangeEvent, GridSortChangeEvent, GridFilterOperators, GridHeaderSelectionChangeEvent, GridKeyDownEvent, GridRowDoubleClickEvent, GridSelectionChangeEvent, GridDetailRowProps, GridRowProps, GridCellProps, GridRowClickEvent, GridColumnProps, GridProps, GridHandle, GridCustomCellProps } from "@progress/kendo-react-grid";
import "../resources/styles/Theme.scss";
import { RegionView, useViewModelInstance, AutomationHelper } from "@kinetix/core";
import { BlotterColumnDefinition, RowListFilter, BlotterSelectionContext, GridOperationModes, IBlotter, IDatasetView, ColumnMenuFilter } from ".";
import { ExcelExport, ExcelExportColumn } from "@progress/kendo-react-excel-export";
import { GridPDFExport } from "@progress/kendo-react-pdf";
import { BlotterGridCustomCellView } from "./BlotterGridCell/BlotterGridCellView";
import { DATA_ITEM_KEY, EDIT_FIELD, EXPANDED_FIELD, EXPANDED_ROW, idGetter, NULL_DATA, SELECTED_FIELD } from "./Utils/constants";
import { getAllowedGridFilterOperators, getFilterName } from "./Utils/Operators";
import { getSelectedStateFromKeyDown } from "@progress/kendo-react-data-tools";
import "./Blotter.scss";
import { get, orderBy } from "lodash";
import { Helpers } from "../Utils/Helpers";
import { BlotterContextMenu } from "./ContextMenu/BlotterContextMenu";
import { BlotterContext } from "./BlotterContext";
import { DataTypes, getAllFilterDescriptor } from "../Data";

interface IBlotterProps extends GridProps {
  missingCellTemplate?: ComponentType<GridCustomCellProps>;
  detailView?: (rowProps: GridDetailRowProps) => any;
  columns?: GridColumnProps[];
  detailColumns?: GridColumnProps[];
  dataContext: IBlotter;
}

export const BlotterView = React.forwardRef<GridHandle, IBlotterProps>((props: IBlotterProps, ref) => {
  const dataContext = useViewModelInstance(props.dataContext);
  const allowedOperators: GridFilterOperators = {
    ...getAllowedGridFilterOperators(),
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

  const onContextMenu = async (e: any, gridRowProps: GridRowProps, isDetailRow: boolean, detailIndex: number) => {
    e.preventDefault();

    let columns, items: any[], datasetView, selectedState;

    if (isDetailRow) {
      columns = dataContext.model.detailColumns;
      items = dataContext.model.detailItems[detailIndex];
      datasetView = dataContext.detailDatasetView!;
      selectedState = dataContext.model.detailSelectedState[detailIndex] ?? {};
    } else {
      columns = dataContext.model.columns;
      items = dataContext.model.items;
      datasetView = dataContext.datasetView;
      selectedState = dataContext.model.selectedState;
    }

    // on right click if row is already selected dont do anything
    // else unselect rest of rows and select the current
    const selectedStateKey = idGetter(gridRowProps.dataItem);
    const isSelected = selectedState[selectedStateKey];
    const isControlKey: boolean = e.ctrlKey || e.metaKey;
    const isShiftKey: boolean = e.shiftKey;

    if (!isSelected) {
      let newSelectedState: { [id: string]: boolean | number[] } = {};

      if (isControlKey || isShiftKey) {
        newSelectedState = dataContext.model.selectedState;
      }

      if (isShiftKey) {
        handleShiftSelection(newSelectedState);
      }

      newSelectedState[selectedStateKey] = true;

      dataContext.updateModel((m) => {
        if (isDetailRow) {
          m.detailSelectedState[detailIndex] = newSelectedState;
        } else {
          m.selectedState = newSelectedState;
          selectedState = m.selectedState;
        }
      });
    }

    const selection = await getSelection(items, selectedState, columns);
    const offset: Offset = { left: e.clientX, top: e.clientY };
    await dataContext.contextMenu.onContextMenu(offset, dataContext.model.id || datasetView.id, datasetView.datasetID, selection);

    function handleShiftSelection(newSelectedState: { [id: string]: boolean | number[] }) {
      let properties = Object.getOwnPropertyNames(newSelectedState);
      let currSel = gridRowProps.dataItem[DATA_ITEM_KEY];
      if (properties.length === 1) {
        let prevSel = properties[0];
        let currIndex = items.findIndex((x) => x[DATA_ITEM_KEY] === currSel);
        let prevIndex = items.findIndex((x) => x[DATA_ITEM_KEY] === prevSel);
        if (currIndex && prevIndex) {
          while (currIndex !== prevIndex) {
            if (currIndex > prevIndex) {
              currIndex--;
              newSelectedState[items[currIndex][DATA_ITEM_KEY]] = true;
            } else {
              currIndex++;
              newSelectedState[items[currIndex][DATA_ITEM_KEY]] = true;
            }
          }
        }
      }
    }
  };

  const rowRender = (trElement: any, gridRowProps: GridRowProps, isDetailRow: boolean = false, detailIndex: number = 0) => {
    const trProps = {
      ...trElement.props,
      onDoubleClick: async (e: any) => {
        const datasetView = isDetailRow ? dataContext.detailDatasetView : dataContext.datasetView;
        if (datasetView) {
          await dataContext.contextMenu.onDoubleClick(dataContext.model.id || datasetView.id, datasetView.datasetID, { rows: [gridRowProps.dataItem] });
        }
      },
      onContextMenu: async (e: any) => {
        await onContextMenu(e, gridRowProps, isDetailRow, detailIndex);
      },
    };

    return React.cloneElement(trElement, { ...trProps }, trElement.props.children);
  };

  const DragCell = (props: GridCellProps) => {
    return (
      <td
        onDrop={(e) => {
          dataContext.draggable.dragEnd();
          e.preventDefault();
        }}
        onDragOver={(e) => {
          dataContext.draggable.reorder(props.dataItem);
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
        }}
      >
        <span
          className="k-icon k-font-icon k-i-reorder"
          draggable={dataContext.draggable.enable}
          style={{ cursor: "move" }}
          onDragStart={(e) => {
            dataContext.draggable.activeDragItem = props.dataItem;
            e.dataTransfer.setData("dragging", "");
          }}
        />
      </td>
    );
  };

  const onHeaderSelectionChange = (event: GridHeaderSelectionChangeEvent) => {
    const checkboxElement: any = event.syntheticEvent.target;
    const checked = checkboxElement.checked;
    dataContext.onHeaderSelectionChanged(checked);
  };

  const onDetailSelectionChange = (event: GridSelectionChangeEvent, detailIndex: number) => {
    setTimeout(() => {
      const newSelectedState = getSelectedState({
        event,
        selectedState: dataContext.model.detailSelectedState[detailIndex],
        dataItemKey: DATA_ITEM_KEY,
      });

      dataContext.model.detailItems[detailIndex].forEach((item: any) => {
        item[SELECTED_FIELD] = newSelectedState[idGetter(item)];
      });

      dataContext.updateModel((m) => (m.detailSelectedState[detailIndex] = newSelectedState));
    });
  };

  const isEventChildOfDetailGrid = (e: any) => {
    const target = e.nativeEvent?.target;

    for (let x = target; x; x = x.parentElement) {
      if (x.classList.contains("blotter-detail-grid")) {
        return true;
      }
    }

    return false;
  };

  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    if (isEventChildOfDetailGrid(event)) {
      return;
    }

    const newSelectedState = getSelectedState({
      event,
      selectedState: dataContext.model.selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    dataContext.updateModel((m) => (m.selectedState = newSelectedState));
  };

  const _exportToExcelCompRef = React.useRef<ExcelExport | null>(null);
  dataContext.exportToExcel =  async () => {
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

  const isColumnFiltered = (column: string) => {
    const blotterState = dataContext.model.state;
    if (blotterState?.filter?.filters) {
      const filters = getAllFilterDescriptor(blotterState.filter) ;
      const columnFilter = filters.find((f) => f.field === column );
      if (columnFilter) {
        return true;
      }
    }

    return false;
  };

  const onKeyDown = async (event: GridKeyDownEvent) => {
    
    const newSelectedState = getSelectedStateFromKeyDown({
      event,
      selectedState: dataContext.model.selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    dataContext.updateModel((m) => (m.selectedState = newSelectedState));
   
    const isControlKey: boolean = event.nativeEvent.ctrlKey || event.nativeEvent.metaKey;

    if (isControlKey && event.nativeEvent.keyCode === 67) {
      let selection = await getSelection(dataContext.model.items, dataContext.model.selectedState, dataContext.model.columns);

      if (selection.cells) {
        let text = Helpers.jsonToFlatternText(selection.cells);
        await navigator.clipboard.writeText(text);
      }
    }
  };

  const onRowDoubleClick = async (e: GridRowDoubleClickEvent, datasetView: IDatasetView) => {
    await dataContext.contextMenu.onDoubleClick(datasetView.id, datasetView.datasetID, { rows: [e.dataItem] });
  };

  const handleGridColumnReorder = async (e: GridColumnReorderEvent): Promise<void> => {
    let columns = e.columns.map((c) => {
      return {
        name: c.field!,
        orderIndex: c.orderIndex! >= 0 ? c.orderIndex! : -1,
      };
    });
    await dataContext.handleGridColumnReorder(columns);
  };

  const handleOnSortChange = (e: GridSortChangeEvent) => {
    dataContext.sortChange(e.sort);
  };

  const handleGridDataStateChange = (e: GridDataStateChangeEvent) => {
    dataContext.dataStateChange(e.dataState);
  };

  const getColumnWidth = (column: BlotterColumnDefinition): number => {
    const widthInfo = dataContext.model.columnWidths.find((item) => item.name === column.name);
    return widthInfo ? widthInfo.width : 100;
  };

  const handleGridColumnResize = (e: GridColumnResizeEvent) => {
    if (e.end) {
      console.log("Grid Resize", e);
      const col = e.columns[e.index];
      if (col) {
        dataContext.handleGridColumnResize(col.field!, dataContext.selectionSettings.headerSelection ? e.index - 1 : e.index, e.newWidth);
      }
    }
  };

  const cellRender = (td: any, props: GridCellProps) => {
    const context = useContext(BlotterContext);
    const Template = context?.missingCellTemplate;

    if (td?.props.children && props.rowType === "groupHeader") {
      let children = (
        <span data-automationid="group-header" className="group-header-cell">
          <span>{td.props.children.props.children[0]}</span>
          <span>{props.dataItem[props.field || ""] == NULL_DATA ? Template ? <Template {...props} /> : "" : td.props.children.props.children[1]}</span>
          <span>{`(${props.dataItem.items.length})`}</span>
        </span>
      );
      return React.cloneElement(td, td.props, children);
    }
    return td;
  };

  const detailGrid = (gridRowProps: GridDetailRowProps) => {
    if (!dataContext.detailDatasetDefinition?.columns) {
      return null;
    }

    const data = dataContext.model.detailItems[gridRowProps.dataIndex];
    if (!data) {
      return null;
    }

    return (
      <Grid
        className="blotter-detail-grid"
        dataItemKey={DATA_ITEM_KEY}
        selectedField={SELECTED_FIELD}
        data={data}
        rowRender={(x, y) => rowRender(x, y, true, gridRowProps.dataIndex)}
        selectable={{
          enabled: dataContext.selectionSettings.enabled,
          drag: dataContext.selectionSettings.drag,
          cell: dataContext.selectionSettings.cell,
          mode: dataContext.selectionSettings.mode,
        }}
        onSelectionChange={(e) => onDetailSelectionChange(e, gridRowProps.dataIndex)}
        onRowDoubleClick={(e) => onRowDoubleClick(e, dataContext.detailDatasetView!)}
        cellRender={cellRender}
        onRowClick={(e: GridRowClickEvent) => {
          if (dataContext.onRowClick) {
            dataContext.onRowClick(e.dataItem);
          }
        }}
      >
        {mergeDataSetColumns(
          dataContext.model.detailColumns.map((column) => {
            const colProps: GridColumnProps = {
              editable: column.editable,
              locked: column.locked,
              editor: column.editable === true ? dataContext.getEditorType(column.type) : undefined,
              title: column.displayName,
              filter: getFilterName(column.type),
              filterable: true,
              field: column.name,
              columnMenu: dataContext.model.columnFilters ? ColumnMenuFilter : undefined,
              headerClassName: isColumnFiltered(column?.name) ? "column-header filtered active" : "column-header",

              cells: {
                data: column.editable ? undefined : BlotterGridCustomCellView,
                filterCell: column.type == DataTypes.enum || column.type == DataTypes.list ? RowListFilter : undefined,
              },
            };

            return colProps;
          }),
          props.detailColumns
        ).map((column) => (
          <GridColumn key={`${column.field}-${column.title}`} {...column} />
        ))}
      </Grid>
    );
  };

  const loadingPanel = (
    <div className="loading-panel">
      <div className="k-loading-mask">
        <span className="k-loading-text">{dataContext.model.busyText}</span>
        <div className="k-loading-image"></div>
        <div className="k-loading-color"></div>
      </div>
    </div>
  );

  const isColumnEditable = (field?: string): boolean => {
    const activeColumns = dataContext.model.columns;
    const column = activeColumns.find((x) => x.name == field);
    return column?.editable === true;
  };

  const mergeDataSetColumns = (dataSetColumns: GridColumnProps[], propColumns: GridColumnProps[] | undefined): GridColumnProps[] => {
    if (propColumns && propColumns.length > 0) {
      console.debug("dataSetColumns", dataSetColumns)
      console.debug("propColumns", propColumns)
      let results: GridColumnProps[] = [];
      dataSetColumns.forEach((datasetColumn) => {
        const gridCol = propColumns.find((x) => x.field === datasetColumn.field);
        if (gridCol) {
          results.push({ ...datasetColumn, ...gridCol });
        } else {
          results.push({ ...datasetColumn });
        }
      });

      propColumns.forEach((column) => {
        const gridCol = results.find((x) => x.field === column.field);
        if (!gridCol) {
          results.push({ ...column });
        }
      });

      const colWithOrder = results.filter(c=>c.orderIndex !== undefined);
      const colWithoutOrder = results.filter(c=>c.orderIndex === undefined);
     colWithOrder.sort((x, y) => {
        if (x.orderIndex && y.orderIndex) {
          return x.orderIndex - y.orderIndex
        }
        return 0;
      });

      //console.debug("colWithOrder", colWithOrder)
      //console.debug("colWithoutOrder", colWithoutOrder)

      const finalColumns = [...colWithOrder,...colWithoutOrder]
      //console.debug("mergeDataSetColumns", finalColumns)
      return finalColumns

    }

    return orderBy(dataSetColumns, "orderIndex", "asc");
  };

  const getGridClassNames = () => {
    if (dataContext.model.configuration.settings.gridMode === GridOperationModes.Server) {
      if (dataContext.model.state.skip && dataContext.model.state.take) {
        let pageIndex = dataContext.model.state.skip / dataContext.model.state.take;
        // let hidePagerNumbers = pageIndex >= 10;
        let hidePagerNumbers = false;
        return `${props.className} blotter-grid-server ${hidePagerNumbers ? "blotter-grid-hide-pager-numbers" : ""}`;
      }
    }

    return "blotter-grid-server";
  };

  const grid = (
    <Grid
      ref={ref}
      className={getGridClassNames()}
      dataItemKey={DATA_ITEM_KEY}
      selectedField={SELECTED_FIELD}
      editField={dataContext.model.editable ? EDIT_FIELD : undefined}
      sortable={dataContext.model.sortable}
      reorderable={!dataContext.toolbar.isActive()}
      columnVirtualization={false}
      groupable={dataContext.model.isGroupable && dataContext.model.configuration.settings.allowGrouping && !dataContext.model.configuration.disableGrouping}
      resizable={!dataContext.toolbar.isActive()}
      pageable
      filterOperators={allowedOperators}
      filterable={dataContext.model.quickFilters}
      navigatable={true}
      selectable={{
        enabled: dataContext.selectionSettings.enabled,
        drag: dataContext.selectionSettings.drag,
        cell: dataContext.selectionSettings.cell,
        mode: dataContext.selectionSettings.mode,
      }}
      data={dataContext.model.getDataResult()}
      rowRender={props.rowRender ? props.rowRender : rowRender}
      cellRender={cellRender}
      onRowDoubleClick={(e) => onRowDoubleClick(e, dataContext.datasetView)}
      onRowClick={(e: GridRowClickEvent) => {
        if (dataContext.onRowClick) {
          dataContext.onRowClick(e.dataItem);
        }
      }}
      onItemChange={
        dataContext.model.editable
          ? (e) => {
            if (isColumnEditable(e.field)) {
              dataContext.handleOnItemChange(e.field, e.dataItem, e.value);
            }
          }
          : undefined
      }
      onDataStateChange={handleGridDataStateChange}
      
      onSelectionChange={onSelectionChange}
      onHeaderSelectionChange={onHeaderSelectionChange}
      onKeyDown={onKeyDown}
      onColumnReorder={handleGridColumnReorder}
      onColumnResize={handleGridColumnResize}
      onExpandChange={(e) => dataContext.handleGridExpandChange(e.dataItem, e.value, e.dataIndex)}
      onSortChange={handleOnSortChange}
      detail={props.detailView ? props.detailView : dataContext.detailDatasetView && detailGrid}
      expandField={dataContext.detailDatasetView || props.detailView ? EXPANDED_ROW : EXPANDED_FIELD}
      total={dataContext.model.configuration.settings.gridMode === GridOperationModes.Server ? dataContext.model.totalServerCount : undefined}
      {...dataContext.model.state}
    >
      {props.children}
      {dataContext.selectionSettings.headerSelection && <GridColumn field={SELECTED_FIELD} orderIndex={0} width="44px" headerSelectionValue={dataContext.model.items.findIndex((item) => !dataContext.model.selectedState[idGetter(item)]) === -1} />}

      {dataContext.draggable && <GridColumn title="" width="40px" cell={DragCell} />}
      {mergeDataSetColumns(
        dataContext.model.columns.map((column, order) => {
          const colProps: GridColumnProps = {
            editable: column.editable,
            locked: column.locked,
            editor: column.editable === true ? dataContext.getEditorType(column.type) : undefined,
            title: column.displayName,
            width: getColumnWidth(column),
            orderIndex: column.order && column.order >=0 ?dataContext.selectionSettings.headerSelection ? order + 1 : order:dataContext.model.columns.length,

            filter: getFilterName(column.type),
            field: column.name,
            headerClassName: isColumnFiltered(column?.name) ? "column-header filtered" : "column-header",
            cells: {
              data: column.editable ? undefined : BlotterGridCustomCellView,
              filterCell: column.type == DataTypes.enum || column.type == DataTypes.list ? RowListFilter : undefined,
            },

            columnMenu: dataContext.model.columnFilters ? ColumnMenuFilter : undefined,
          };

          return colProps;
        }),
        props.columns
      ).map((column) => (
        <GridColumn key={`${column.field}-${column.title}`} {...column} />
      ))}
      <GridColumn key={`fillspaceColumn`} orderIndex={dataContext.model.columns.length + 10} />
    </Grid>
  );

  const gridContext = useMemo(() => {
    return {
      model: dataContext.model,
      datasetDefinition: dataContext.datasetDefinition,
      missingCellTemplate: props.missingCellTemplate,
    };
  }, [dataContext.datasetDefinition, dataContext.model]);

  const gridContainer = (
    <>
      {dataContext.datasetView ? (
        <div className="grid-wrapper" data-automationid={AutomationHelper.GetId(`blotter-${dataContext.datasetView.name}`)}>
          {dataContext.datasetDefinition && (
            <BlotterContext.Provider value={gridContext}>
              <ExcelExport
                data={dataContext.model.exportItems}
                ref={_exportToExcelCompRef}
                onExportComplete={() =>
                  dataContext.updateModel((m) => {
                    m.busyText = "";
                    m.exportItems = [];
                  })
                }
              >
                {dataContext.model.columns.map((column, index) => (
                  <ExcelExportColumn key={`exportExcel-${column.name}`} title={column.displayName} width={getColumnWidth(column)} field={column.name} />
                ))}
              </ExcelExport>

              <BlotterContextMenu dataContext={dataContext.contextMenu} />
              <div className="blotter-grid-panel">
                {/* RENDER GRID */}
                {dataContext.model.isLoadingData && loadingPanel}
                {grid}
                {exportingToPdf  ? (
                  <React.Suspense fallback={loadingPanel}>
                    <GridPdfExporter
                      grid={grid}
                      columns={dataContext.model.columns.map((c) => {
                        return {
                          field: c.name,
                          title: c.displayName,
                          width: getColumnWidth(c),
                        };
                      })}
                      data={dataContext.model.items}
                      exportPDF={exportingToPdf}
                      exportCallback={() => {
                        setExportingToPdf(false);
                      }}
                    />
                  </React.Suspense>
                ) : (
                  <>{dataContext.model.busyText && loadingPanel}</>
                )}
              </div>
            </BlotterContext.Provider>
          )}
        </div>
      ) : (
        loadingPanel
      )}
    </>
  );

  return (
    dataContext.datasetView && (
      <div
        className="blotter"
        onKeyDown={
          !dataContext.model.showToolbar
            ? async (e) => {
              await dataContext.showOptions(e.shiftKey, e.key);
            }
            : undefined
        }
      >
        {dataContext.model.showToolbar && !dataContext.model.configuration.toolbarCollapsed && <RegionView viewModel={dataContext.toolbar} exportExcelHandler={dataContext.exportToExcel} exportPdfHandler={handleExportToPdf} />}

        {gridContainer}
      </div>
    )
  );
});

const GridPdfExporter = (props: { grid: any; columns: { field: any; title: any; width: string | number | undefined }[]; data: any[]; exportPDF: any; exportCallback: () => void }): JSX.Element => {
  let gridPDFExport: GridPDFExport | null = null;
  React.useEffect(() => {
    try {
      gridPDFExport?.save(props.data, props.exportCallback);
    } catch (e) {
      console.error(e);
      props.exportCallback();
    }
  }, [gridPDFExport, props]);
  return (
    <GridPDFExport
      ref={(element) => {
        gridPDFExport = element;
      }}
    >
      {props.columns.map((column) => (
        <GridColumn key={`exportPdf-${column.field}`} title={column.title} width={column.width} field={column.field} />
      ))}
      {props.grid}
    </GridPDFExport>
  );
};
