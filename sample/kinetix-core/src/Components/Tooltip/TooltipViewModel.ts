import { PopoverPosition } from "@progress/kendo-react-tooltip";
import { ConfigurationItem, IConfigurationId, type IConfigurationService } from "../../Configuration";
import { CoreTypes } from "../../CoreTypes";
import { IocInject, IocInjectable } from "../../IoC";
import { ViewModelBase } from "../../Mvvm";
import { type IEventAggregator } from "../../Messaging";
import { IDisposable, CompositeDisposable } from "../../Core";
import { ResetTooltipEvent } from "./Events/ResetTooltipEvent";


export interface IToolTipContext {
  id: string;
  title: string;
  message: string;
  position: PopoverPosition;
  anchor: string;
}

export interface ITutorialContext {
  context: IToolTipContext[];
  skippedTutorial: boolean;
}

export class TooltipModel {
  showTutotial: boolean;
  tutorials: ITutorialContext | undefined;
  tutorialIndex: number = 0;
  configId: IConfigurationId | undefined;
}

@IocInjectable()
export class TooltipViewModel extends ViewModelBase<TooltipModel> {
  private readonly configService: IConfigurationService;
  events: IEventAggregator;
  resetSubscription: IDisposable | undefined;

  protected createModel(): TooltipModel {
    return new TooltipModel();
  }

  constructor(@IocInject(CoreTypes.IConfigurationService) configService: IConfigurationService,@IocInject(CoreTypes.IEventAggregator) events: IEventAggregator) {
    super();
    this.configService = configService;
    this.events= events;
  }

  protected async onCleanup(): Promise<void> {
      if(this.resetSubscription){
        this.resetSubscription.dispose();
        this.resetSubscription = undefined;
      }
  }

  protected async onInitialize(): Promise<void> {
    this.resetSubscription = new CompositeDisposable([
      this.events.getEvent<ResetTooltipEvent>(ResetTooltipEvent,ResetTooltipEvent.Type).subscribe(async payload =>
      {
        await this.resetTooltip(payload.toolTipConfigurations);
      }),
    ]
     )
  }

  async resetTooltip(configIds: IConfigurationId[]){
    await Promise.all(configIds.map(x=>this.configService.deleteConfiguration(x)));
    
    configIds.forEach(configId => {
      const localStorageKey = `tooltip_skipped_${configId.application}_${configId.category}_${configId.section}_${configId.item}`;
      localStorage.removeItem(localStorageKey);
    });
    
    for (const configId of configIds) {
      const configItem = new ConfigurationItem<ITutorialContext>();
      configItem.application = configId.application;
      configItem.category = configId.category;
      configItem.section = configId.section;
      configItem.item = configId.item;
      
      if (configId.item === "DocViewerTips") {
        configItem.value = {
          skippedTutorial: false,
          context: [
            {
              id: "1",
              anchor: ".version-selector",
              position: "bottom",
              title: "Document Versions",
              message: "Explore and compare previous versions of the document here.",
            },
            {
              id: "2",
              anchor: ".bookmarks-link",
              position: "bottom",
              title: "Resources and Bookmarks",
              message: "Switch between tabs to see associated resources or browse bookmarks that you save from this document.",
            },
            {
              id: "3",
              anchor: ".topbar-bookmark",
              position: "bottom",
              title: "Toolbar",
              message: "Here are useful tools for the document. Bookmark parts of document, see the contractual form and launch the compare mode between different documents.",
            },
            {
              id: "4",
              anchor: ".html-editor",
              position: "bottom",
              title: "Smart Document",
              message: "Lookup the meaning of defined terms by clicking on highlighted terms and explore the enriched document.",
            },
          ],
        };
      } else if (configId.item === "RepoViewTips") {
        configItem.value = {
          skippedTutorial: false,
          context: [
            {
              id: "1",
              anchor: ".primary-doc-name",
              position: "bottom",
              title: "Library view",
              message: "Here are all the documents that you can view. Click on the ancillary documents link to expand all ancillary documents attached to a publication.",
            },
            {
              id: "2",
              anchor: ".header-profile",
              position: "bottom",
              title: "Collections",
              message: "Your collections are now stored in your user profile. Save full documents or fragments for easy access and later reading. Perfect for organizing important information and keeping your favorite content at your fingertips!",
            },
          ],
        };
      }
      
      await this.configService.saveConfiguration<ITutorialContext>(configItem);
    }
    
    // Determine which tooltip to show based on current page
    const currentPath = window.location.pathname;
    if (currentPath.includes('repository') && configIds.some(id => id.item === 'RepoViewTips')) {
      const repoConfigId = configIds.find(id => id.item === 'RepoViewTips');
      if (repoConfigId) {
        await this.startTutorial(repoConfigId);
      }
    } else if (configIds.some(id => id.item === 'DocViewerTips')) {
      const docConfigId = configIds.find(id => id.item === 'DocViewerTips');
      if (docConfigId) {
        await this.startTutorial(docConfigId);
      }
    }
  }

  public async startTutorial(configId: IConfigurationId): Promise<void> {
    const localStorageKey = `tooltip_skipped_${configId.application}_${configId.category}_${configId.section}_${configId.item}`;
    const localSkipState = localStorage.getItem(localStorageKey);
    
    if (localSkipState === 'true') {
      this.updateModel((m) => {
        m.showTutotial = false;
        m.tutorialIndex = 0;
        m.configId = configId;
      });
      return;
    }
    
    const config = await this.configService.getConfiguration<ITutorialContext>(configId);
    
    if(config){
      const firstAnchor = config.value.context?.[0]?.anchor;
      if (firstAnchor) {
        const anchorElement = document.querySelector(firstAnchor);
        if (!anchorElement && !config.value.skippedTutorial) {
          setTimeout(() => this.startTutorial(configId), 200);
          return;
        }
      }
      
      this.updateModel((m) => {
        m.tutorials = config.value;
        m.showTutotial = !config.value.skippedTutorial;
        m.tutorialIndex = 0;
        m.configId = configId;
      });
    }
  }

  public async stopTutorial(): Promise<void> {
    if (this.model.tutorials && this.model.configId) {
      const configItem = new ConfigurationItem<ITutorialContext>();
      configItem.application = this.model.configId.application;
      configItem.category = this.model.configId.category;
      configItem.section = this.model.configId.section;
      configItem.item = this.model.configId.item;
      configItem.value = { context: this.model.tutorials.context, skippedTutorial: true };

      try {
        await this.configService.saveConfiguration<ITutorialContext>(configItem);
        
        const key = `${configItem.application}.${configItem.category}.${configItem.section}.${configItem.item}`;
        delete (this.configService as any).configCache[key];
        
        const localStorageKey = `tooltip_skipped_${configItem.application}_${configItem.category}_${configItem.section}_${configItem.item}`;
        localStorage.setItem(localStorageKey, 'true');
      } catch (error) {
        console.debug("Failed to save tooltip configuration:", error);
      }

      this.updateModel((m) => {
        m.showTutotial = false;
        m.tutorialIndex = 0;
      });
    }
  }

  public updateTutorialIndex(index: number) {
    if (this.model.tutorials?.context.length === index) {
      this.stopTutorial();
      return;
    }

    this.updateModel((m) => {
      m.tutorialIndex = index;
    });
  }

  /**
   * Currently, KendoUI React does not support changing position of
   * it's callout element. So following method is implemented to
   * handle callout's position depending upon anchor element's center point.
   *
   * you can track this issue at following link
   * https://github.com/telerik/kendo-ui-core/issues/6762
   */
  public handleCalloutPosition(): void {
    try {
      const calloutEl = document.querySelector("#tooltip-body .k-popover-callout")! as HTMLElement;
      const anchorEl = document.querySelector(`${this.model.tutorials?.context[this.model.tutorialIndex]?.anchor}`)! as HTMLElement;

      if (calloutEl) {
        calloutEl.innerHTML = `<div class="beacon-container beacon-${this.model.tutorials?.context[this.model.tutorialIndex].position}"><div class="beacon-container-inner" /></div>`;
      }

      if (calloutEl && anchorEl) {
        const calloutElPos = calloutEl.getBoundingClientRect();
        const calloutCenterPointFromLeft = calloutElPos.left + calloutElPos.width / 2;
        const anchorElPos = anchorEl.getBoundingClientRect();
        const anchorCenterPointFromLeft = anchorElPos.left + anchorElPos.width / 2;
        const tooltipSweetSpot = anchorCenterPointFromLeft + 200; // tooltip width is 400px, so middlepoint will be 200px
        const isTooltipSweetSpotOutsideViewPort = tooltipSweetSpot > window.innerWidth;
        const adjustCalloutPosition = parseInt(Number(anchorCenterPointFromLeft - calloutCenterPointFromLeft).toFixed());

        if (adjustCalloutPosition && isTooltipSweetSpotOutsideViewPort) {
          calloutEl.setAttribute("style", `left: calc(50% + ${adjustCalloutPosition}px) !important`);
        }
      }
    } catch (error) {
      console.warn("Unable to set custom callout position", error);
    }
  }
}
