import { WidgetModel } from "../WidgetModel";

export class PieWidgetModel extends WidgetModel {
    totalCount: number;
    items: IPieWidgetItem[] = [];
}

export interface IPieWidgetItem {
    key: string;
    displayName: string;
    value: number;
    color: string;
}