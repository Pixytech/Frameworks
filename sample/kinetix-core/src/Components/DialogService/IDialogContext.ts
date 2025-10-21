import { IViewModel } from "../../Mvvm";
import { WindowStage } from "./DialogContext";
import { IDialogComponent } from "./IDialogComponent";

export interface IHeaderTemplateProps {
  dataContext: IViewModel;
  dialogComponent: IDialogComponent;
}

export interface IDialogContext {
  title?: string;
  headerTemplate?: React.FC<IHeaderTemplateProps>;
  style?: React.CSSProperties;
  className?: string;
  initialWidth?: number;
  initialHeight?: number;
  width?: number;
  height?: number;
  isModel?: boolean;
  resizable?: boolean;
  stage?: WindowStage;
  draggable?: boolean;
  canMinimize?: boolean;
  canMaximize?: boolean;
  canClose?: boolean;
  cyclicTab?: boolean;
  onClose?(): void;
  windowAction?: string;
}
