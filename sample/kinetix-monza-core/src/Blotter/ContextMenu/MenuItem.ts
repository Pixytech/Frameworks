import { INavigationAware } from "@kinetix/core";
import { BlotterSelectionContext } from "./BlotterSelectionContext";

export class MenuItem {
  id: string;
  displayName?: string;
  icon?: string;
  isSeparator?: boolean;
  onSelect: (
    selection: BlotterSelectionContext,
    parent: INavigationAware
  ) => Promise<void>;
  disabled?: boolean;
}
