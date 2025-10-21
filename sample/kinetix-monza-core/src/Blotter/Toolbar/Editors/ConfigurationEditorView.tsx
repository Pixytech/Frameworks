import { RegionView, useViewModelInstance, AutomationHelper } from "@kinetix/core";
import { Button } from "@progress/kendo-react-buttons";
import { GridLayout, StackLayout, TabStrip, TabStripTab } from "@progress/kendo-react-layout";

import { ConfigurationEditorViewModel } from "./ConfigurationEditorViewModel";
import { TicketLayout, FormCard, FormText, LabelPosition, FormTextArera, TicketSubmitButton, FormButton, FormBoolean, FormBooleanVariation } from "../../../Forms";
import { EditPages } from "./ConfigurationEditorModel";

export interface ConfigurationEditorViewProps {
  dataContext: ConfigurationEditorViewModel;
}

export const ConfigurationEditorView = (props: ConfigurationEditorViewProps) => {
  const dataContext = useViewModelInstance(props.dataContext);
  return (
    <TicketLayout
      viewModel={dataContext}
      footer={() => {
        return (
          <StackLayout orientation="horizontal" gap={5} align={{ horizontal: "end" }}>
            <Button data-automationid={AutomationHelper.GetId("reset")} type={"button"} onClick={() => dataContext.reset()}>
              Reset
            </Button>
            <TicketSubmitButton data-automationid={AutomationHelper.GetId("apply")} viewModel={dataContext}>
              {dataContext.model.defaultPage === EditPages.SaveAs ? "Save" : "Apply"}
            </TicketSubmitButton>
          </StackLayout>
        );
      }}
    >
      <TabStrip selected={dataContext.model.selectedTab} onSelect={(e) => dataContext.updateModel((m) => (m.selectedTab = e.selected))}>
        <TabStripTab title="Overview">
          <FormCard>
            <GridLayout style={{ width: "100%", height: "100%" }} rows={[{ height: "auto" }, { height: "auto" }, { height: "1fr" }, { height: "auto" }]}>
              <FormText row={1} minLabelWidth="120px" required={true} labelPosition={LabelPosition.Left} label="Blotter Name" dataContext={dataContext.blotterName} />
              <FormText readonly={true} row={2} minLabelWidth="120px" labelPosition={LabelPosition.Left} label="Parent Blotter" dataContext={dataContext.parentBlotter} />
              <FormTextArera row={3} minLabelWidth="120px" labelPosition={LabelPosition.Left} style={{ height: "100%" }} label="Description" dataContext={dataContext.blotterDescription} />
              <FormCard title="Settings" row={4}>
                <StackLayout style={{ width: "100%" }} orientation="vertical" align={{ vertical: "top" }}>
                  <FormBoolean labelPosition={LabelPosition.Left} minLabelWidth={"110px"} variation={FormBooleanVariation.switch} label="Show toolbar" dataContext={dataContext.showToolbar} />
                  {/* TODO : allow hide show toolbar  */}
                  {dataContext.blotter.model.isGroupable && dataContext.blotter.model.configuration.settings.allowGrouping ? <FormBoolean labelPosition={LabelPosition.Left} minLabelWidth={"110px"} variation={FormBooleanVariation.switch} label="Allow grouping" dataContext={dataContext.allowGrouping} /> : <></>}

                  <StackLayout style={{ width: "100%" }} orientation="horizontal" align={{ vertical: "middle", horizontal: "end" }}>
                    <FormButton fillMode={"flat"} themeColor={"error"} dataContext={dataContext.resetToDefaults} icon={"refresh"}>
                      Reset To Defaults
                    </FormButton>
                  </StackLayout>
                </StackLayout>
              </FormCard>
            </GridLayout>
          </FormCard>
        </TabStripTab>
        <TabStripTab title="Columns">
          <FormCard>
            <RegionView viewModel={dataContext.columnConfigViewModel} />
          </FormCard>
        </TabStripTab>
        <TabStripTab title="Custom Filters">
          <FormCard>
            <RegionView viewModel={dataContext.customFilterViewModel} />
          </FormCard>
        </TabStripTab>
        <TabStripTab title="Cell Formatting">
          <FormCard>
            <RegionView viewModel={dataContext.cellFormattingViewModel} />
          </FormCard>
        </TabStripTab>
      </TabStrip>
    </TicketLayout>
  );
};
