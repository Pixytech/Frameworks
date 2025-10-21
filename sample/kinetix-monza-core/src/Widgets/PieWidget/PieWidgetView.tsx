import { useViewModelInstance, AutomationHelper } from "@kinetix/core";
import { FC } from "react";
import { Chart, ChartLegend, ChartSeries, ChartSeriesItem, ChartTooltip } from "@progress/kendo-react-charts";
import { IPieWidget } from "./IPieWidget";
import "hammerjs";
import "./PieWidgetViewStyles.scss";
import { Loader } from "@progress/kendo-react-indicators";
import ResizeObserver from "rc-resize-observer";
import { ITermWidget } from "../models";
import { AggregationType } from "../../Utils/analyticsService";

export interface IPieWidgetViewProps {
  viewModel: IPieWidget;
}

export const PieWidgetView: FC<IPieWidgetViewProps> = (props) => {
  const vm = useViewModelInstance(props.viewModel);
  const sortedItems = [...vm.model.items].sort((a, b) => b.value - a.value);
  const termDef = vm as unknown as ITermWidget;
  const isMultiCategory = vm.isMultiCategory;

  const handleChartRefresh = (chartOptions: any, themeOptions: any, chartInstance: any) => {
    chartInstance.setOptions(chartOptions, themeOptions);
  };

  const numFormatter = (num: number) => {
    let min = 1000;
    // Alter numbers larger than 1k
    if (num >= min) {
      let units = ["k", "M", "Bn", "T"];

      let order = Math.floor(Math.log(num) / Math.log(1000));

      let unitname = units[order - 1];
      let result = Number(num / 1000 ** order);

      // output number remainder + unitname
      return result.toFixed(2) + unitname;
    }

    // return formatted original number
    return num.toString();
  };

  return (
    <ResizeObserver onResize={vm.handleWidgetResize}>
      <div className={`kx-widget kx-pie-widget ${vm.model.items.length > 0 ? "" : "empty"} ${vm.model.showFullView ? "chart-section-full-view" : ""}`}>{vm.model.isLoading || vm.model.isFirstRender ? <Loader /> : PieWidgetRender()}</div>
    </ResizeObserver>
  );

  function PieWidgetRender() {
    const donutCenterRender = () => <span className="center-value">{termDef.aggregationType === AggregationType.Count ? vm.model.totalCount : numFormatter(vm.model.totalCount)}</span>;
    
    if (!vm.model.items || vm.model.items.length === 0) {
      return <span>No Content</span>;
    }

    // Use multi-category layout for more than 2 items
    if (isMultiCategory) {
      return (
        <>
          <div className="content multi-category-centered">
            <div data-automationid={AutomationHelper.GetId("chart")} className="chart-section-centered">
              <Chart onRefresh={handleChartRefresh} donutCenterRender={donutCenterRender} className="chart" transitions={vm.model.isFirstRender} onSeriesClick={vm.showDetails}>
                <ChartSeries>
                  <ChartSeriesItem 
                    type={vm.isDonut ? "donut" : undefined} 
                    data={sortedItems} 
                    categoryField="displayName" 
                    field="value" 
                    colorField="color" 
                    holeSize={vm.customHoleSize || 44}
                    spacing={2} // Add spacing between segments
                    border={{
                      width: 0,
                      color: "transparent"
                    }}
                    tooltip={{
                      visible: true,
                      format: "{0}: {1:P1}",
                      background: "rgba(0,0,0,0.8)",
                      color: "white",
                      padding: 8,
                      font: "12px Arial, sans-serif",
                      border: {
                        width: 0
                      }
                    }}
                    highlight={{
                      visible: true,
                      opacity: 0.8
                    }}
                    overlay={{
                      gradient: "none"
                    }}
                  />
                </ChartSeries>
                <ChartLegend visible={false} />
                <ChartTooltip 
                  render={(props: any) => {
                    if (!props || !props.point) return null;
                    const { point } = props;
                    const percentage = (point.value * 100).toFixed(1);
                    const count = Math.round(vm.model.totalCount * point.value);
                    const name = point.dataItem.displayName || point.category;
                    
                    return (
                      <div style={{
                        background: 'rgba(0,0,0,0.9)',
                        color: 'white',
                        padding: '10px 14px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                      }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{name}</div>
                        <div>{count} ({percentage}%)</div>
                      </div>
                    );
                  }}
                />
              </Chart>
            </div>
          </div>
        </>
      );
    }

    // Use original binary layout for 2 or fewer items
    return (
      <>
        <div className="content">
          <div data-automationid={AutomationHelper.GetId("left content")} className="term first" onClick={() => vm.showDetails({ dataItem: vm.model.items[0] })}>
            <span className="label">
              <span className="dot" style={{ backgroundColor: `${vm.model.items[0].color}` }}></span>
              {vm.model.items[0].displayName}
            </span>
            <span className="share-percent">{(vm.model.items[0].value * 100).toFixed(2)}%</span>
            <span className="share">{termDef.aggregationType === AggregationType.Count ? Math.round(vm.model.totalCount * vm.model.items[0].value) : numFormatter(Math.round(vm.model.totalCount * vm.model.items[0].value))}</span>
          </div>
          <div data-automationid={AutomationHelper.GetId("chart")} className="chart-section">
            <Chart onRefresh={handleChartRefresh} donutCenterRender={donutCenterRender} className="chart" transitions={vm.model.isFirstRender} onSeriesClick={vm.showDetails}>
              <ChartSeries>
                <ChartSeriesItem 
                  type={vm.isDonut ? "donut" : undefined} 
                  data={sortedItems} 
                  categoryField="key" 
                  field="value" 
                  colorField="color" 
                  holeSize={44}
                  spacing={2} // Add spacing between segments
                  border={{
                    width: 0,
                    color: "transparent"
                  }}
                  tooltip={{
                    visible: true,
                    format: "{0}: {1:P1}",
                    background: "rgba(0,0,0,0.8)",
                    color: "white",
                    padding: 8,
                    font: "12px Arial, sans-serif",
                    border: {
                      width: 0
                    }
                  }}
                  highlight={{
                    visible: true,
                    opacity: 0.8
                  }}
                  overlay={{
                    gradient: "none"
                  }}
                />
              </ChartSeries>
              <ChartLegend visible={false} />
              <ChartTooltip 
                render={(props: any) => {
                  if (!props || !props.point) return null;
                  const { point } = props;
                  const percentage = (point.value * 100).toFixed(1);
                  const count = Math.round(vm.model.totalCount * point.value);
                  const name = point.dataItem.displayName || point.category || point.dataItem.key;
                  
                  return (
                    <div style={{
                      background: 'rgba(0,0,0,0.9)',
                      color: 'white',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      whiteSpace: 'nowrap',
                      pointerEvents: 'none',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                    }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{name}</div>
                      <div>{count} ({percentage}%)</div>
                    </div>
                  );
                }}
              />
            </Chart>
          </div>
          {vm.model.items.length > 1 && (
            <div data-automationid={AutomationHelper.GetId("right content")} className="term second" onClick={() => vm.showDetails({ dataItem: vm.model.items[1] })}>
              <span className="label">
                <span className="dot" style={{ backgroundColor: `${vm.model.items[1].color}` }}></span>
                {vm.model.items[1].displayName}
              </span>
              <span className="share-percent">{(vm.model.items[1].value * 100).toFixed(2)}%</span>
              <span className="share">{termDef.aggregationType === AggregationType.Count ? Math.round(vm.model.totalCount * vm.model.items[1].value) : numFormatter(Math.round(vm.model.totalCount * vm.model.items[1].value))}</span>
            </div>
          )}
        </div>
      </>
    );
  }
};
