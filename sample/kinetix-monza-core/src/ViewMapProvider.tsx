import { IocInjectable, IViewMapProvider, IViewResolver } from "@kinetix/core";
import { IBlotter, BlotterColumnConfigView, IBlotterColumnConfig, IBlotterCellFormatting, IBlotterCellFormatRowGroup, MainToolbarView, MainToolbarViewModel, IMainToolbar, HeaderViewModel, IHeader, WorkspaceFooterView, WorkspaceFooterViewModel, PdfFilePopup, PdfFilePopupView } from ".";
import { BlotterCustomFiltersView, IBlotterCustomFilter, BlotterCustomFilterViewModel, BlotterColumnConfigViewModel, BlotterCellFormatRowGroupView, BlotterCellFormatRowGroupViewModel, BlotterCellFormattingView, BlotterCellFormattingViewModel, BlotterFormatOptionsPopupView, IBlotterCellFormatOptionsPopup, BlotterCellFormatOptionsPopupViewModel, IBlotterToolbar, BlotterToolbar, BlotterToolbarViewModel, ConfigurationEditorView, ConfigurationEditorViewModel } from "./Blotter";
import { BlotterView } from "./Blotter/BlotterView";
import { BlotterViewModel } from "./Blotter/BlotterViewModel";
import { RemoteFileBrowserField } from "./Forms/Fields/FormUpload/RemoteFileBrowser/RemoteFileBrowserField";
import { RemoteFileBrowserView } from "./Forms/Fields/FormUpload/RemoteFileBrowser/RemoteFileBrowserView";

import { TradingCoreTypes } from "./TradingCoreTypes";
import { BarWidgetView, BarWidgetViewModel, IBarWidget } from "./Widgets/BarWidget";
import { ILiveInquiryWidget, LiveInquiryWidgetView, LiveInquiryWidgetViewModel } from "./Widgets/LiveInquiryWidget";
import { IPieWidget, PieWidgetView, PieWidgetViewModel } from "./Widgets/PieWidget";
import { ITopNWidget, TopNWidgetView, TopNWidgetViewModel } from "./Widgets/TopNWidget";
import { IWidgetContainer, WidgetContainerView, WidgetContainerViewModel } from "./Widgets";
import { HeaderView } from "./Common/WorkspaceHeader/HeaderView";

@IocInjectable()
export class ViewMapProvider implements IViewMapProvider {
  provideMap(resolver: IViewResolver): void {
    resolver.register((model) => <HeaderView dataContext={model as IHeader} title="-" />, HeaderViewModel);

    resolver.register((viewModel) => <ConfigurationEditorView dataContext={viewModel as ConfigurationEditorViewModel} />, ConfigurationEditorViewModel);

    resolver.register((viewModel, _, props: any) => <BlotterToolbar dataContext={viewModel as IBlotterToolbar} {...props} />, BlotterToolbarViewModel);

    resolver.register((viewModel) => <WidgetContainerView viewModel={viewModel as IWidgetContainer} />, WidgetContainerViewModel);
    resolver.register((viewModel) => <PieWidgetView viewModel={viewModel as IPieWidget} />, PieWidgetViewModel);
    resolver.register((viewModel) => <TopNWidgetView viewModel={viewModel as ITopNWidget} />, TopNWidgetViewModel);
    resolver.register((viewModel) => <BarWidgetView viewModel={viewModel as IBarWidget} />, BarWidgetViewModel);
    resolver.register((viewModel) => <LiveInquiryWidgetView viewModel={viewModel as ILiveInquiryWidget} />, LiveInquiryWidgetViewModel);
    resolver.register((model) => <PdfFilePopupView dataContext={model as PdfFilePopup} />, PdfFilePopup);
    resolver.register((field) => <RemoteFileBrowserView field={field as RemoteFileBrowserField} />, RemoteFileBrowserField);
    resolver.register((model) => <BlotterView dataContext={model as IBlotter} />, BlotterViewModel, TradingCoreTypes.Blotter);

    resolver.register((viewModel) => <BlotterCustomFiltersView dataContext={viewModel as IBlotterCustomFilter} />, BlotterCustomFilterViewModel);
    resolver.register((viewModel) => <BlotterColumnConfigView dataContext={viewModel as IBlotterColumnConfig} />, BlotterColumnConfigViewModel);
    resolver.register((viewModel) => <BlotterCellFormattingView dataContext={viewModel as IBlotterCellFormatting} />, BlotterCellFormattingViewModel);

    resolver.register((viewModel) => <BlotterCellFormatRowGroupView dataContext={viewModel as IBlotterCellFormatRowGroup} />, BlotterCellFormatRowGroupViewModel);
    resolver.register((viewModel) => <BlotterFormatOptionsPopupView dataContext={viewModel as IBlotterCellFormatOptionsPopup} />, BlotterCellFormatOptionsPopupViewModel);
    resolver.register((viewModel) => <MainToolbarView dataContext={viewModel as IMainToolbar} />, MainToolbarViewModel);
    resolver.register((viewModel) => <WorkspaceFooterView dataContext={viewModel as WorkspaceFooterViewModel} />, WorkspaceFooterViewModel);
  }
}
