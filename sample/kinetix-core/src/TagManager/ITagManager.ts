
import { BuildManifest } from "../Components/AppManifest";
import { ITagLogger } from "./ITagAdapter";

export const IApmServiceType = Symbol.for("ITagManager");

export interface ITagManager {
  initialize(
    profile: string,
    buildInfo: BuildManifest,
  ): Promise<void>;

  get Tag(): ITagLogger;
}
