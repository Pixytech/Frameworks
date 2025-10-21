import { WidgetModel } from "../WidgetModel";

export class TopNWidgetModel extends WidgetModel {
    totalCount: number;
    items: ITopNWidgetItem[] = [];
}

export interface ITopNWidgetItem {
    position: number;
    key: string;
    displayName: string;
    value: number;
    color: string;
    data: {a: any, b: any}
}