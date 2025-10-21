import { BuildManifest, LogLevel } from "..";
import { IApmAdapter } from "./IApmAdapter";

export const IApmServiceType = Symbol.for("IApmService");

export interface IApmService {
  initialize(
    profile: string,
    buildInfo: BuildManifest,
    loglevel?: LogLevel
  ): Promise<void>;

  get Apm(): IApmAdapter;
}
