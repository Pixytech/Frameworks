import { ITermPageContext } from "./ITermPageContext";

export const IFooterConfigProviderType = Symbol.for("IFooterConfigProvider");

export interface IFooterConfigProvider {
  text: string;
  logo: string;
  getConfigs(): Promise<ITermPageContext[]>;
}
