import { useViewModelInstance } from "@kinetix/core";
import { FC } from "react";
import {
  Chart,
  ChartTitle,
  ChartSeries,
  ChartSeriesItem,
  ChartCategoryAxis,
  ChartCategoryAxisTitle,
  ChartCategoryAxisItem,
  ChartLegend,
  ChartAxisDefaults,
  SeriesClickEvent,
} from "@progress/kendo-react-charts";
import { IBarWidget } from "./IBarWidget";
import "hammerjs";
import "./BarWidgetViewStyles.scss";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { Group, Path } from "@progress/kendo-drawing";
import { number } from "prop-types";
import { Loader } from "@progress/kendo-react-indicators";

export interface IBarWidgetViewProps {
  viewModel: IBarWidget;
}

function numFormatter(num: number) {
  let min = 1000;
  // Alter numbers larger than 1k
  if (num >= min) {
    var units = ["k", "M", "Bn", "T"];

    var order = Math.floor(Math.log(num) / Math.log(1000));

    var unitname = units[order - 1];
    var num = Math.floor(num / 1000 ** order);

    // output number remainder + unitname
    return num + unitname;
  }

  // return formatted original number
  return num.toString();
}

const labelContent = (e: any) => numFormatter(e.value);

export const BarWidgetView: FC<IBarWidgetViewProps> = (props) => {
  const vm = useViewModelInstance(props.viewModel);

  const getTabContent = () => {
    return (
      <Chart
        className="chart"
        onSeriesClick={(event: SeriesClickEvent) => vm.showDetails(event)}
      >
        <ChartLegend position="bottom" orientation="horizontal" />
        <ChartCategoryAxis>
          <ChartCategoryAxisItem
            categories={vm.getXAxisIntervals().slice(0, 4)}
          />
        </ChartCategoryAxis>
        <ChartAxisDefaults labels={{ content: labelContent }} />
        <ChartSeries>
          {vm.model.items.map((series) => (
            <ChartSeriesItem
              key={series.name}
              name={series.name}
              type="column"
              stack={vm.stack}
              data={series.data}
            />
          ))}
        </ChartSeries>
      </Chart>
    );
  };

  const getTabs = () => {
    return (
      <TabStrip
        className="kx-tabs widget-tabs bar-widget-tabs"
        selected={vm.model.selectedIntervalTab}
        onSelect={(e) => vm.handleIntervalTabChange(e.selected)}
      >
        <TabStripTab title="Monthly">{getTabContent()}</TabStripTab>
        <TabStripTab title="Quaterly">{getTabContent()}</TabStripTab>
        <TabStripTab title="Yearly">{getTabContent()}</TabStripTab>
      </TabStrip>
    );
  };

  return (
    <div
      className={`kx-widget kx-bar-widget ${
        vm.model.isLoading || vm.model.isFirstRender ? "loading" : ""
      }`}
    >
      {vm.model.isLoading || vm.model.isFirstRender ? <Loader /> : getTabs()}
    </div>
  );
};
