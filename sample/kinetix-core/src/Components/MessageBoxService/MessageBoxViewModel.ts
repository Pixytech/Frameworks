import { HtmlEditorViewModel, IHtmlEditor, IHtmlEditorModel, ReadOnlyPlugin } from "../..";
import { DelegateCommandOf, ICommandOf, ViewModelBase } from "../../Mvvm";
import { IDialogAware, IDialogContext, IDialogService } from "../DialogService";
import { MessageBoxButton } from "./MessageBoxButton";
import { MessageBoxImage } from "./MessageBoxImage";
import { MessageBoxResult } from "./MessageBoxResult";
export class MessageBoxModel {}

export class MessageBoxViewModel extends ViewModelBase<MessageBoxModel> implements IDialogAware {
  private readonly dialogService: IDialogService;
  private defaultResult: MessageBoxResult;
  public Buttons: MessageBoxButton;
  public MessgaeBoxText: string;
  public Result: MessageBoxResult;
  public Command: ICommandOf<MessageBoxResult>;
  public IconType: MessageBoxImage;
  public MessgaeBoxHtml:IHtmlEditor<IHtmlEditorModel> = new HtmlEditorViewModel();
  public IsHtmlContents:boolean = false;
  dialogContext: IDialogContext;
  onClose: (result: MessageBoxResult) => void;
  configure: (vm: MessageBoxViewModel) => void;
  footerText:{
    ok:string;
    cancel:string;
    yes:string;
    no:string;
  } = {ok:"Ok",cancel:"Cancel",yes:"Yes",no:"No"};

  constructor(dialogService: IDialogService, messageBoxText: string, onClose: (result: MessageBoxResult) => void, button: MessageBoxButton, icon: MessageBoxImage, defaultResult: MessageBoxResult,configure:(vm:MessageBoxViewModel)=>void = (v)=>{}) {
    super();
    this.configure= configure;
    this.MessgaeBoxText = messageBoxText;
    this.dialogService = dialogService;
    this.Buttons = button;
    this.IconType = icon;
    this.defaultResult = defaultResult;
    this.Result = this.defaultResult;
    this.onClose = onClose;
    this.MessgaeBoxHtml.model.content = messageBoxText;
    this.MessgaeBoxHtml.onCreatePlugins = (currentPlugins) => {
      const plugins = [...currentPlugins, ReadOnlyPlugin];
      return plugins;
    };
    this.Command = new DelegateCommandOf<MessageBoxResult>(
      (p) => this.onUserAction(p),
      () => true
    );
  }
  OnDialogCreated(context: IDialogContext): void {
    this.dialogContext = context;
    this.configure(this);
    this.dialogContext.className = `messageBox-window ${this.dialogContext.className}`;
  }


  OnDialogClose(): void {
    this.onClose(this.Result);
  }

  public getIconClassName(iconType: MessageBoxImage): string {
    switch (iconType) {
      case MessageBoxImage.Error:
        return "message-box-icon message-box-error k-icon k-font-icon k-i-close-circle k-i-x-circle";
      case MessageBoxImage.Hand:
        return "message-box-icon message-box-error k-icon k-font-icon k-i-close-circle k-i-x-circle";
      case MessageBoxImage.Stop:
        return "message-box-icon message-box-error k-icon k-font-icon k-i-close-circle k-i-x-circle";
      case MessageBoxImage.Question:
        return "message-box-icon k-icon k-font-icon k-i-question k-i-help";
      case MessageBoxImage.Exclamation:
        return "message-box-icon message-box-warning";
      case MessageBoxImage.Warning:
        return "message-box-icon message-box-warning";
      case MessageBoxImage.Asterisk:
        return "message-box-icon k-icon k-font-icon k-i-information k-i-info";
      case MessageBoxImage.Information:
        return "message-box-icon k-icon k-font-icon k-i-information k-i-info";
      default:
        return "";
    }
  }
  private onUserAction(argument: MessageBoxResult): void {
    this.Result = argument;
    this.dialogService.Close(this);
  }

  protected createModel(): MessageBoxModel {
    return new MessageBoxModel();
  }
}
