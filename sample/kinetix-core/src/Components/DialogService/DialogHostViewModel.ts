import { DialogComponentViewModel } from "./DialogComponentViewModel";
import { IDialogComponent } from "./IDialogComponent";
import { IDialogOptions } from "./IDialogOptions";
import { DialogHostModel } from "./DialogHostModel";
import { IDialogHost } from "./IDialogHost";
import { getDialogAware, IDialogAware } from "./IDialogAware";
import { IocInjectable } from "../../IoC";
import { ViewModelBase, IViewModel } from "../../Mvvm";
import { using } from "../../Core";


@IocInjectable()
export class DialogHostViewModel extends ViewModelBase<DialogHostModel> implements IDialogHost {
  Activate(dialog: IDialogComponent): boolean {
    var index = this.Dialogs.indexOf(dialog);
    //todo activate by view model
    return true;
  }

  Close(dialog: IDialogComponent, result: boolean = true) {
    const onclose = dialog.model.onClose;
    var index = this.Dialogs.indexOf(dialog);
    this.Dialogs.splice(index, 1);

    if (onclose) {
      onclose();
    }

    var modelAwareVm = dialog.model.content as unknown as IDialogAware;
    if (modelAwareVm.OnDialogClose) {
      modelAwareVm.OnDialogClose();
    }

    if (dialog.Closed) {
      setTimeout(() => {
        if (dialog.Closed) {
          dialog.Closed(result);
        }
      }, 200);
    }
    this.notifyModelChanged();
  }

  Create(viewModel: IViewModel, dialogOptions: IDialogOptions): IDialogComponent {
    var component: IDialogComponent = new DialogComponentViewModel(this);
    var modelAwareVm = getDialogAware(viewModel);
    if (modelAwareVm) {
      using(viewModel.SuspendNotifications(), () => {
        modelAwareVm?.OnDialogCreated(dialogOptions, component);
      });
    }

    component.model.initialHeight = dialogOptions.initialHeight;
    component.model.initialWidth = dialogOptions.initialWidth;
    component.model.stage = dialogOptions.stage;
    component.model.title = dialogOptions.title;

    component.model.canClose = dialogOptions.canClose;
    component.model.canMaximize = dialogOptions.canMaximize;
    component.model.canMinimize = dialogOptions.canMinimize;
    component.model.draggable = dialogOptions.draggable;
    component.model.resizable = dialogOptions.resizable;
    component.model.isModel = dialogOptions.isModel;
    component.model.headerTemplate = dialogOptions.headerTemplate;
    component.model.cyclicTab = dialogOptions.cyclicTab;
    component.model.className = dialogOptions.className;
    component.model.style = dialogOptions.style;
    component.model.content = viewModel;
    component.model.onClose = dialogOptions.onClose;
    this.Dialogs.push(component);
    this.notifyModelChanged();
    return component;
  }

  TryFindWindowForViewModel(viewModel: IViewModel): IDialogComponent | undefined {
    const index = this.Dialogs.findIndex((value, _index) => value.model.content === viewModel);

    if (index >= 0) {
      var dialogComponent = this.Dialogs.at(index);
      return dialogComponent;
    }
    return undefined;
  }

  Dialogs: IDialogComponent[] = [];

  protected createModel(): DialogHostModel {
    return new DialogHostModel();
  }
}
