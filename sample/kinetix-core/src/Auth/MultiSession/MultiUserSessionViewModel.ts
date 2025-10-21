
import { IDialogAware, IDialogContext, IDialogService, IDialogComponent } from "../../Components/DialogService";
import { IocInject, IocInjectable } from "../../IoC";
import { DelegateCommand, ViewModelBase } from "../../Mvvm";
import { type IAuthenticationService, IAuthenticationServiceType } from "../IAuthenticationService";

export class MultiUserSessionModel {
  countdown: number;
  
}

@IocInjectable()
export class MultiUserSessionViewModel extends ViewModelBase<MultiUserSessionModel> implements IDialogAware {
  dialogContext: IDialogContext;
  signin: DelegateCommand = new DelegateCommand(async()=>{
   await this.autheService.DoLogout({redirectUri:window.location.origin});
  },()=>true);
  autheService: IAuthenticationService;
  coundownSubscription: NodeJS.Timeout;
  

  constructor(@IocInject(IAuthenticationServiceType) autheService: IAuthenticationService){
    super();
    this.autheService= autheService;
  }

  show(dialogService: IDialogService):Promise<boolean> {

      return dialogService.ShowDialog(this);
  }

  OnDialogCreated(context: IDialogContext, dialogComponent?: IDialogComponent): void {
     this.dialogContext = context;
      context.title = "Signed in on another device";
      context.initialWidth = 450;
      context.initialHeight = 180;
      context.canClose = false;
      context.isModel = true; // Modal dialog
      context.draggable = true;
      context.resizable = true;
      context.canMaximize = false;
      context.canMinimize = false;
    this.dialogContext.className = `multi-user-session-dialog`;
    this.autheService.autoRefreshToken = false;
    this.updateModel(m=>m.countdown = 30);
    this.coundownSubscription = setInterval(() => {
      this.updateModel(m=>{
        m.countdown = m.countdown - 1;
        if(m.countdown <0){
          m.countdown = 0;
          clearInterval(this.coundownSubscription);
          this.autheService.DoLogout({redirectUri:window.location.origin});
        }
      } )
    }, 1000);
  }
  OnDialogClose(): void {
    this.autheService.autoRefreshToken = true;
    clearInterval(this.coundownSubscription);
  }
 


  protected createModel(): MultiUserSessionModel {
    return new MultiUserSessionModel();
  }
}
