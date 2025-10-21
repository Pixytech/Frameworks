import { INavigationAware } from "@kinetix/core";
import { ComponentType } from "./ComponentType";
import { IContextMenuService } from "./ContextMenuService";
import { MenuItem } from "./MenuItem";
import { BlotterSelectionContext } from "./BlotterSelectionContext";

export const IMenuProviderType = Symbol.for("IMenuProviderType");

export interface IMenuProvider {
  ComponentId: string[];
  ComponentType: ComponentType | string[];
  onDoubleClick(datasetID: string, selection: BlotterSelectionContext, parent: INavigationAware): Promise<void>;
  getContextMenus(datasetId: string, selection: BlotterSelectionContext, service: IContextMenuService): Promise<MenuItem[]>;
}
