import { IViewModelBase } from "@kinetix/core";

import { AssetType } from "../../AssetType";
import { CompositeDataFilter } from "../../Data";
import { RecordType } from "../../RecordType";
import { IWidget } from "../IWidget";
import { IWidgetDefinition } from "../models";
import { LiveInquiryWidgetModel } from "./LiveInquiryWidgetModel";

export interface ILiveInquiryWidget
  extends IViewModelBase<LiveInquiryWidgetModel>,
    IWidget {
  configure(
    widgetDefinition: ILiveInquiryWidgetDefinition,
    filters: CompositeDataFilter
  ): void;
  onRowDoubleClick(
    id: string,
    assetType: AssetType,
    recordType: RecordType
  ): void;
}

export interface ILiveInquiryWidgetDefinition extends IWidgetDefinition {}
