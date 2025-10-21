import { IViewModel } from "../../Mvvm";
import { IDialogComponent } from "./IDialogComponent";
import { IDialogContext } from "./IDialogContext";

export interface IDialogAware {
  OnDialogCreated(
    context: IDialogContext,
    dialogComponent?: IDialogComponent
  ): void;
  OnDialogClose(): void;
}

export function getDialogAware(instance: IViewModel): IDialogAware | null {
  try {
    const assume = instance as any as IDialogAware;
    if (
      assume &&
      assume.OnDialogClose !== undefined &&
      assume.OnDialogCreated !== undefined
    ) {
      return assume;
    }
  } catch (e) {}

  return null;
}
