import { IViewModel, IViewModelBase } from "@kinetix/core";
import { IHeader } from "../WorkspaceHeader/IHeader";
import { WorkspaceModel } from "./WorkspaceModel";
import { Location } from "react-router-dom";
export interface IWorkspaceItem extends IViewModel {}

export interface IWorkspace extends IViewModelBase<WorkspaceModel> {
  getContent(path: string): IWorkspaceItem;
  getCurrentDrawerText(location: Location): string;
  getHeaderViewModel(): IHeader;
}
