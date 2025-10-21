import { INavigationRoute } from "./INavigationRoute";

export const IApplicationRoutesType = Symbol.for("IApplicationRoutes");
export interface IApplicationRoutes extends INavigationRoute {}
