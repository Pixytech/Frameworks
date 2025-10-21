import { IDialogService } from "./IDialogService";
import { IDialogOptions } from "./IDialogOptions";
import type { IDialogHost } from "./IDialogHost";
import { DialogHostViewModel } from "./DialogHostViewModel";
import { IocInjectable, IocInject } from "../../IoC";
import { IViewModel } from "../../Mvvm";
import { IDialogComponent } from "./IDialogComponent";

@IocInjectable()
export class DialogService implements IDialogService {
  private readonly dialogHost: IDialogHost;
  constructor(@IocInject(DialogHostViewModel) dialogHost: IDialogHost) {
    this.dialogHost = dialogHost;
  }

  getDialog(viewModel: IViewModel): IDialogComponent | undefined {
    return this.dialogHost.TryFindWindowForViewModel(viewModel);
  }

  Activate(viewModel: IViewModel): boolean {
    var context = this.dialogHost.TryFindWindowForViewModel(viewModel);
    if (context) {
      return context.Activate();
    }
    return false;
  }

  ShowDialog(
    viewModel: IViewModel,
    dialogOptions?: IDialogOptions
  ): Promise<boolean> {
    var windowDialogOptions = dialogOptions
      ? dialogOptions
      : { isModel: true, canClose: true };
    return new Promise((resolve, reject) => {
      const onClose: (result: boolean) => void = (r) => {
        resolve(r);
      };
      const dialog = this.ShowInternal(viewModel, windowDialogOptions);
      dialog.Closed = onClose;
    });
  }

  Show(viewModel: IViewModel, dialogOptions?: IDialogOptions): void {
    if (dialogOptions) {
      dialogOptions.isModel = false;
    } else {
      dialogOptions = { isModel: false, canClose: true };
    }

    this.ShowInternal(viewModel, dialogOptions);
  }

  ShowInternal(
    viewModel: IViewModel,
    dialogOptions: IDialogOptions
  ): IDialogComponent {
    return this.dialogHost.Create(viewModel, dialogOptions);
  }

  Close(viewModel: IViewModel, result: boolean = true): void {
    var context = this.dialogHost.TryFindWindowForViewModel(viewModel);
    if (context) {
      context.Close(result);
    }
  }
}
