
import { BuildManifest } from "../Components/AppManifest";
import { ITagLogger } from "./ITagAdapter";


export const ITagManagerServiceType = Symbol.for("ITagManagerService");

export interface ITagManagerService {
  initialize(
    profile: string,
    buildInfo: BuildManifest,
  ): Promise<void>;

  get Tag(): ITagLogger;
}
