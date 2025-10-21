import {
  CoreTypes,
  IContainer,
  IDialogService,
  IDisposable,
  IEventAggregator,
  IInteropProvider,
  IStreamingService,
  IStreamingServiceType,
  IntentContext,
  InteropContainerType,
  IRestClient
} from "@kinetix/core";
import {Observable} from "rxjs";
import {AssetType} from "./AssetType";
import {TicketLaunchEvent} from "./Events";
import {FormModel, IFormViewModel} from "./Forms";
import {ILayoutProvider} from "./ILayoutProvider";
import {LifecycleEvents} from "./LifeCycleEvents";
import {PropertyModel, TicketData} from "./TicketData";
import {TradingCoreTypes} from "./TradingCoreTypes";
import { BlotterStream, BlotterStreamPayload } from "./Blotter/BlotterStream";
import { IComponentShell } from "./IComponentShell";



export const getTicketData = (apiClient: IRestClient, dataUrl: string, e: TicketData): Observable<any> => {
  let url = dataUrl;
  const idProperty = getTicketDataField(e.properties, "id");
  if (idProperty) {
    url += "/";
    url += encodeURI(idProperty.value);
  }

  if (e.eventType === LifecycleEvents.Create || e.eventType === LifecycleEvents.SetTradeStatusAndComment || e.eventType === LifecycleEvents.Compare) {
    if(e.assetType != AssetType.REF_DATA) {
      url += "/new";
    }else{
      console.debug("getting data for new ref ticket", url);
      return apiClient.get<any>(url);
    }

    const properties = new Map<string, string>();

    e.properties.forEach((v, _i, _a) => {
      properties.set(v.fieldName, v.value);
    });
    console.debug("getting data for new ticket", url);
    return apiClient.post<any, any>(url, Object.fromEntries(properties));
  } else if (e.eventType === LifecycleEvents.Clone) {
    url += "/clone";
  } else if (e.eventType === LifecycleEvents.CloneOffset) {
    url += "/clone_offset";
  }
  console.debug("getting data for existing ticket", url);
  return apiClient.get<any>(url);
};

const getTicketDataField = (properties: PropertyModel[], field: string): PropertyModel | undefined => {
  return properties.find((p) => p.fieldName === field);
};

export class TicketHook {
  public static readonly Instance: TicketHook = new TicketHook();
  subscription: IDisposable;

  public async onLoad(container: IContainer): Promise<void> {
    console.debug("On load ticket module");
    const events = container.build<IEventAggregator>(CoreTypes.IEventAggregator);
    const interopProvider = container.build<IInteropProvider>(CoreTypes.IInteropProvider);
    if (interopProvider.isPlatformAvailable && interopProvider.interop && interopProvider.containerType === InteropContainerType.Component) {
      console.debug("Subscribe to ticket intents");

      await interopProvider.interop.registerIntentHandler("MonzaTickets", (name: string, context: IntentContext) => {
        return this.onHandleIntent(name, context, container);
      });
    }

    if(this.subscription){
      this.subscription.dispose();
    }

   this.subscription= events.getEvent<TicketLaunchEvent>(TicketLaunchEvent, TicketLaunchEvent.Type).subscribe(async (e) => {
      const matchedProvider = this.getLayoutProvider(container, e.assetType);
      if (matchedProvider) {
        if (interopProvider.isPlatformAvailable && interopProvider.interop) {
          const intentName = matchedProvider.getIntentName(e);
          console.debug(`Raising intent ${intentName}`);
          await interopProvider.interop.raiseIntent(intentName, {
            type: "Kinetix",
            data: { data: JSON.stringify(e) },
          });
        } else {
          await this.launchTicket(container, e, matchedProvider, false);
        }
      } else {
        console.warn(`No matching provider found for asset type :${e.assetType}`);
      }
    });
  }

  private async onHandleIntent(name: string, context: IntentContext, container: IContainer): Promise<void> {
    console.debug(`Handle intent ${name}`, context);
    if (context.data) {
      const data = JSON.parse(context.data["data"]) as TicketData;
      const matchedProvider = this.getLayoutProvider(container, data.assetType);
      if (matchedProvider) {
        await this.launchTicket(container, data, matchedProvider, true);
      }
    }
  }

  private async launchTicket(container: IContainer, e: TicketData, layoutProvider: ILayoutProvider, isInteropContainer: boolean) {
    const dialogService = container.build<IDialogService>(CoreTypes.IDialogService);

    const liveUpdates = container.build<IStreamingService>(IStreamingServiceType);

    console.debug("launching ticket for event", e);

    const productType = e.productType ? e.productType : "";
    const dataUrl = layoutProvider.getDataEndpoint(e.eventType, e.recordType, productType);

    await launchTicketLayout(undefined, e);

    async function launchTicketLayout(ticketData: any, e: TicketData) {
      const layoutType = await layoutProvider.getLayoutType({ ...e }, false);

      if (layoutType) {
        const ticketVm = container.build<IFormViewModel<FormModel>>(layoutType);
        console.debug("ticketVm", ticketVm);
        ticketVm.launchContext = e;
        ticketVm.eventType = e.eventType;
        ticketVm.dataUrl = dataUrl;
        ticketVm.ticketData = ticketData;
        if (e.eventType === LifecycleEvents.View) {
          ticketVm.model.readonly = true;
        }

        //await ticketVm.initialize();
        await ticketVm.formInitialize();
        const blotterStreamAdapter =   liveUpdates.getAdapter<BlotterStreamPayload>(BlotterStream);
        const liveUpdateState = blotterStreamAdapter.enabled;
        blotterStreamAdapter.enabled = false;
        if (isInteropContainer) {
          const componentShell = container.build<IComponentShell>(CoreTypes.IInteropShell);
          await componentShell.showContent(ticketVm, {
            title: ticketVm.ticketDialog.title,
            canClose: true,
            onClose: () => {
              blotterStreamAdapter.enabled = liveUpdateState;
            },
          });
        } else {
          await dialogService.ShowDialog(ticketVm, {
            title: ticketVm.ticketDialog.title,
            className: "ticket-window",
            canClose: true,
            onClose: () => {
              blotterStreamAdapter.enabled = liveUpdateState;
            },
          });
        }
      } else {
        // this may be via interop ?
        console.warn(`No matching layout found for asset type :${ticketData}`);
      }
    }
  }

  getLayoutProvider(container: IContainer, assetType: AssetType): ILayoutProvider | undefined {
    const providers = container.buildAll<ILayoutProvider>(TradingCoreTypes.ILayoutProvider);
    const matchedProvider = providers.find((p) => p.assetType === assetType);
    if (!matchedProvider) {
      console.warn(`No matching provider found for asset type :${assetType}`);
    }
    return matchedProvider;
  }
}
