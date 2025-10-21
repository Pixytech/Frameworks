import { IocInjectable, ViewModelBase, IocInject, type IThemeService, CoreTypes } from "@kinetix/core";
import { ITermPageContext } from "./ITermPageContext";
import { IFooterConfigProviderType, type IFooterConfigProvider } from "./IFooterConfigProvider";
import { NavigateFunction } from "react-router-dom";

export class WorkspaceFooterModel {
  footerText: string;
  logo: string;
  partnerLogs:string[]=[];
  pageContextList: ITermPageContext[] = [];
}

@IocInjectable()
export class WorkspaceFooterViewModel extends ViewModelBase<WorkspaceFooterModel> {
  private readonly footerConfig: IFooterConfigProvider;
  navigator: NavigateFunction;
  themeService: IThemeService;

  protected createModel(): WorkspaceFooterModel {
    return new WorkspaceFooterModel();
  }

  constructor(@IocInject(IFooterConfigProviderType) footerConfig: IFooterConfigProvider,@IocInject(CoreTypes.IThemeService) themeService: IThemeService) {
    super();
    this.footerConfig = footerConfig;
    this.themeService=themeService;
    this.updateModel(x=>{
      x.partnerLogs = this.themeService.Icons.filter(x=>`${x.name}`.toLowerCase().startsWith("partners-logo")).map(x=>x.name);
    })
  }

  protected override async onInitializeOnce(): Promise<void> {
   
    if (this.model.pageContextList.length <= 0) {
      let contextList = await this.footerConfig.getConfigs();
      this.updateModel((m) => {
        m.footerText = this.footerConfig.text;
        m.logo = this.footerConfig.logo;
        m.pageContextList = contextList;
      });
    }
  }
}
