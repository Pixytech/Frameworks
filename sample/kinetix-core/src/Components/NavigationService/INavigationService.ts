import { type IApplication } from "../../IApplication";
import { INavigationRoute } from "./INavigationRoute";

export const INavigationServiceType = Symbol.for("INavigationServiceType");

export interface INavigationService {
  readonly appsRoutes: INavigationRoute[];
  readonly currentAppRoute: INavigationRoute;
  readonly application: IApplication;
  buildRoutes(): Promise<void>;
}
