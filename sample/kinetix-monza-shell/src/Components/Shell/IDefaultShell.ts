import { IShell } from "@kinetix/core";
import { IWorkspace } from "../Workspace/IWorkspace";
import { DefaultShellModel } from "./DefaultShellModel";

export const IDefaultShellType = Symbol.for("IDefaultShellType");
export interface IDefaultShell extends  IShell<DefaultShellModel> {
  Workspace: IWorkspace;
}