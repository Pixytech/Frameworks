import { INavigationAware, IocInjectable } from "@kinetix/core";
import { IMenuProvider } from "./IMenuProvider";
import { BlotterSelectionContext } from "./BlotterSelectionContext";
import { MenuItem } from "./MenuItem";
import { ComponentType } from "./ComponentType";
import { Helpers } from "../../Utils/Helpers";

@IocInjectable()
export class DefaultMenuProvider implements IMenuProvider {
  async onDoubleClick(datasetID: string, selection: BlotterSelectionContext, parent: INavigationAware): Promise<void> {}
  ComponentId: string[] = []; // applies to all componentIds
  ComponentType: ComponentType[] = [ComponentType.Blotter, ComponentType.DataGrid];

  menuItems: MenuItem[] = [
    {
      id: "copy",
      displayName: "Copy",
      icon: "copy",
      onSelect: async (context: BlotterSelectionContext, parent: INavigationAware) => {
        if (context.cells) {
          const text = Helpers.jsonToFlatternText(context.cells);
          await navigator.clipboard.writeText(text);
        }
      },
      disabled: false,
    },
  ];

  async getContextMenus(_datasetId: string, selection: BlotterSelectionContext): Promise<MenuItem[]> {
    let menus: MenuItem[] = [];
    menus = menus.concat(this.menuItems);
    if (selection.rows) {
      menus.push({
        id: "copyRow",
        displayName: "Copy Row",
        icon: "copy",
        onSelect: async (context: BlotterSelectionContext, parent: INavigationAware) => {
          const text = Helpers.jsonToFlatternText(context.rows);
          await navigator.clipboard.writeText(text);
        },
        disabled: false,
      });
    }
    return menus;
  }
}
