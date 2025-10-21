import { IDrawerItem } from "./IDrawerItem";

export const INavigationRouteType = Symbol.for("INavigationRouteType");

export interface INavigationRoute extends IDrawerItem {
  path: string;
  element: ()=>React.ReactNode;
  routes?: INavigationRoute[];
  exclude?: boolean;
}
