import { ComponentBoundary, RegionView, useViewModelInstance } from "@kinetix/core";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import React, { FC } from "react";
import { IBlotter } from "../../Blotter/IBlotter";
import { AutomationHelper } from "@kinetix/core";
import { WidgetTypes } from "../models";
import { IWidgetContainer } from "./IWidgetContainer";
import { IWidgetTab } from "./WidgetContainerModel";
import { Tooltip } from "@progress/kendo-react-tooltip";
import "./WidgetContainerViewStyles.scss";
import { TabOptionView } from ".";
import { Button } from "@progress/kendo-react-buttons";

export interface IWidgetContainerViewProps {
  viewModel: IWidgetContainer;
}

interface ITabTitleProps {
  tab: IWidgetTab;
}

const BlotterTabTitle = (props: ITabTitleProps) => {
  const blotter = props.tab.widget as IBlotter;
  useViewModelInstance(blotter);

  return (
    <Tooltip anchorElement="pointer" position="top">
      <div className="title-container">
        <span className="title" data-automationid={AutomationHelper.GetId(props.tab.title + " tab")} title={`${props.tab.title} (${blotter.model.totalServerCount})`}>
          {props.tab.title} {`(${blotter.model.totalServerCount})`}
        </span>
        <TabOptionView dataContext={props.tab.optionVM} tab={props.tab} />
      </div>
    </Tooltip>
  );
};

const TabTitle = (props: ITabTitleProps) => {
  return (
    <Tooltip anchorElement="pointer" position="top">
      <div className="title-container">
        <span className="title" data-automationid={AutomationHelper.GetId(props.tab.title + " tab")} title={props.tab.title}>
          {props.tab.title}
        </span>
        <TabOptionView dataContext={props.tab.optionVM} tab={props.tab} />
      </div>
    </Tooltip>
  );
};

export const WidgetContainerView: FC<IWidgetContainerViewProps> = (props) => {
  const vm = useViewModelInstance(props.viewModel);

  return vm.model.key ? (
    <div
      className="kx-widget-container"
      key={vm.model.key}
      data-grid={{
        x: vm.model.column,
        y: vm.model.row,
        w: vm.model.width,
        h: vm.model.height,
        minW: vm.model.width,
        maxH: vm.model.height,
      }}
    >
      <Button className="widget-move-button" icon="move" fillMode="flat" />
      {vm.model.tabs && vm.model.tabs.length > 0 && (
        <TabStrip className="kx-tabs widget-tabs" selected={vm.model.selectedTab} onSelect={(e) => vm.handleTabChange(e.selected)}>
          {vm.model.tabs.map((tab) => (
            <TabStripTab title={tab.widgetType === WidgetTypes.Blotter ? <BlotterTabTitle tab={tab} /> : <TabTitle tab={tab} />} key={tab.key}>
              {tab.widget && (
                <ComponentBoundary>
                  <span className={`widget widget-${tab.key}`} data-automationid={AutomationHelper.GetId("widget " + tab.title)}>
                    <span
                      className="widget-component"
                      {...(WidgetTypes.Blotter
                        ? {
                            "data-automationid": AutomationHelper.GetId(tab.title),
                          }
                        : {})}
                    >
                      <RegionView viewModel={tab.widget} />
                    </span>
                  </span>
                </ComponentBoundary>
              )}
            </TabStripTab>
          ))}
        </TabStrip>
      )}
    </div>
  ) : (
    <span></span>
  );
};
