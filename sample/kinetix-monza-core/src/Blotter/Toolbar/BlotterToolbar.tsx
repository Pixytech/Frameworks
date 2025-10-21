import { Icon, useViewModelInstance, AutomationHelper } from "@kinetix/core";
import { FC } from "react";
import "./BlotterToolbar.scss";
import { Toolbar, ToolbarItem, ToolbarSeparator, ToolbarSpacer } from "@progress/kendo-react-buttons";
import CellFormatingIcon from "../../resources/images/CellFormating.svg";
import ExcelExportIcon from "../../resources/images/ExcelExport.svg";
import PdfExportIcon from "../../resources/images/PdfExport.svg";
import BlotterOptionsIcon from "../../resources/images/BlotterOptions.svg";
import CloneBlotterIcon from "../../resources/images/CloneBlotter.svg";
import ColumnsButtonIcon from "../../resources/images/Columns.svg";
import { BadgeContainer } from "@progress/kendo-react-indicators";
import { TicketLayout, FormButton, FormBoolean, FormBooleanVariation, LabelPosition } from "../../Forms";
import { IBlotterToolbar } from "./IBlotterToolbar";
import { EditPages } from ".";

interface IBlotterToolbarProps {
  dataContext: IBlotterToolbar;
  exportExcelHandler?: () => void;
  exportPdfHandler?: () => void;
}

export const BlotterToolbar: FC<IBlotterToolbarProps> = (props: IBlotterToolbarProps) => {
  const dataContext = useViewModelInstance(props.dataContext);

  return (
    <div className="toolbar">
      <TicketLayout viewModel={dataContext} footer={undefined}>
        <Toolbar>
          <ToolbarItem>
            <FormButton data-automationid={AutomationHelper.GetId("Options")} imageUrl={BlotterOptionsIcon} dataContext={dataContext.optionsButton} commandParameter={EditPages.Options}>
              Options
            </FormButton>
          </ToolbarItem>
          <ToolbarItem>
            <FormButton data-automationid={AutomationHelper.GetId("columns config")} imageUrl={ColumnsButtonIcon} dataContext={dataContext.optionsButton} commandParameter={EditPages.Columns}>
              Columns
            </FormButton>
          </ToolbarItem>
          <ToolbarItem>
            <FormButton data-automationid={AutomationHelper.GetId("Cell Formatting")} imageUrl={CellFormatingIcon} dataContext={dataContext.optionsButton} commandParameter={EditPages.CellFormatings}>
              Cell Formating
            </FormButton>
          </ToolbarItem>
          <ToolbarItem>
            <ToolbarSeparator />

            <ToolbarItem>
              <FormButton data-automationid={AutomationHelper.GetId("Save As")} imageUrl={CloneBlotterIcon} dataContext={dataContext.optionsButton} commandParameter={EditPages.SaveAs}>
                Save As
              </FormButton>
            </ToolbarItem>
            <ToolbarItem>
              <FormButton data-automationid={AutomationHelper.GetId("Excel Export")} imageUrl={ExcelExportIcon} dataContext={dataContext.exportExcelButton} commandParameter={props.exportExcelHandler} hideDisabled={true}>
                Excel Export
              </FormButton>
            </ToolbarItem>
            <ToolbarItem>
              <FormButton data-automationid={AutomationHelper.GetId("PDF Export")} imageUrl={PdfExportIcon} dataContext={dataContext.exportPdfButton} commandParameter={props.exportPdfHandler} hideDisabled={true}>
                PDF Export
              </FormButton>
            </ToolbarItem>
          </ToolbarItem>
          <ToolbarSpacer />

          {dataContext.model.allowAutoRefesh && (
            <ToolbarItem>
              <FormBoolean
                labelPosition={LabelPosition.Left}
                label={
                  <div style={{ fontSize: "10px" }}>
                    Auto
                    <br />
                    Refresh
                  </div>
                }
                variation={FormBooleanVariation.switch}
                dataContext={dataContext.autoRefresh}
              />
            </ToolbarItem>
          )}
          {dataContext.model.allowManualRefesh && (
            <ToolbarItem>
              <BadgeContainer>
                <FormButton className="refresh-button" data-automationid={AutomationHelper.GetId("Refresh")} dataContext={dataContext.refreshButton}>
                  <span title={dataContext.model.isLoadingData ? "Loading data" : "Refresh"}>
                    <Icon icon="refresh" className={`${dataContext.model.rtuCount > 0 ? "refresh-button-icon-rtu" : "refresh-button-icon"} ${dataContext.model.isLoadingData ? "rotating" : ""}`} />
                  </span>
                </FormButton>
              </BadgeContainer>
            </ToolbarItem>
          )}

          <ToolbarItem>
            <FormButton data-automationid={AutomationHelper.GetId("Clear all filter")} dataContext={dataContext.clearFiltersButton}>
              <Icon icon="reset.filter" className="reset-filter-icon" />
              Clear all filters
            </FormButton>
          </ToolbarItem>
        </Toolbar>
      </TicketLayout>
    </div>
  );
};
