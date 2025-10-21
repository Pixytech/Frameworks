import { IDialogContextModel } from "./IDialogContextModel";
import { IViewModel } from "../../Mvvm";
import { IHeaderTemplateProps } from "./IDialogContext";

export enum WindowStage {
  DEFAULT = "DEFAULT",
  FULLSCREEN = "FULLSCREEN",
  MINIMIZED = "MINIMIZED",
}

export class DialogContext implements IDialogContextModel {
  content: IViewModel;
  title?: string;
  headerTemplate?: React.FC<IHeaderTemplateProps>;
  initialWidth?: number | undefined;
  initialHeight?: number | undefined;
  width: number | undefined;
  height: number | undefined;
  isModel?: boolean | undefined;
  resizable?: boolean | undefined;
  draggable?: boolean | undefined;
  canMinimize?: boolean | undefined;
  canMaximize?: boolean | undefined;
  canClose?: boolean | undefined;
  cyclicTab?: boolean | undefined;
  stage?: WindowStage;
  style?: React.CSSProperties;
  className?: string;
  onClose?(): void;
}
