import { WidgetModel } from "../WidgetModel";

export class BarWidgetModel extends WidgetModel {
  xAxisField: string;
  yAxisField: string;
  totalCount: number;
  selectedIntervalTab: number = 0;
  categories: string[] = [];
  items: IBarWidgetSeries[] = [];
}

export interface IBarWidgetSeries {
  name: string;
  color: string;
  data: {value: number, category: string}[];
}