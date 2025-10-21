import { IocInjectable } from "@kinetix/core";
import { AssetType } from "../../AssetType";
import { CompositeDataFilter } from "../../Data";
import { TicketLaunchEvent } from "../../Events";
import { RecordType } from "../../RecordType";
import { dataService } from "../../Utils/blotterApi";
import { WidgetViewModelBase } from "../WidgetViewModelBase";
import { ILiveInquiryWidget, ILiveInquiryWidgetDefinition } from "./ILiveInquiryWidget";
import { LiveInquiryWidgetModel } from "./LiveInquiryWidgetModel";

@IocInjectable()
export class LiveInquiryWidgetViewModel extends WidgetViewModelBase<LiveInquiryWidgetModel> implements ILiveInquiryWidget {
  id: string;
  datasetId: string;
  filters: CompositeDataFilter;

  protected createModel(): LiveInquiryWidgetModel {
    return new LiveInquiryWidgetModel();
  }

  configure(widgetDefinition: ILiveInquiryWidgetDefinition, filters: CompositeDataFilter): void {
    this.datasetId = widgetDefinition.datasetId;
    this.datasetView = widgetDefinition.datasetView!;
    this.drilldownDatasetId = widgetDefinition.drilldownDatasetId ?? this.datasetId;

    this.updateModel((model) => {
      model.filters = filters;
      this.filters = filters;
    });
  }

  loadData = async (isLoad: boolean = true): Promise<void> => {
    try {
      this.setLoading(isLoad);
      let response = await dataService.getDatasetDataByRequest(this.datasetView, 0, 100, [], {}, "", { sort: [{ field: "created", dir: "asc" }] });

      if (response) {
        // console.info("Got Live Data", response);
        this.updateModel((model) => {
          model.totalCount = response.totalCount;
          model.items = response.items;
        });
      }
    } catch (error) {
      console.error("Error loading pie widget data", error);
    } finally {
      this.setLoading(false);
      this.updateModel((model) => (model.isFirstRender = false));
    }
  };

  onRowDoubleClick = (id: string, assetType: AssetType, recordType: RecordType) => {
    this.events.getEvent<TicketLaunchEvent>(TicketLaunchEvent, TicketLaunchEvent.Type).publish({
      assetType: assetType,
      recordType: recordType,
      eventType: "View",
      source: "Kinetix",
      properties: [{ fieldName: "id", value: id }],
    });
  };
}
