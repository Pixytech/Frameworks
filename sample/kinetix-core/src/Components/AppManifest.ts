import { SVGIcon } from "@progress/kendo-svg-icons";

export interface Profile {
  type: ProfileType;
  name: string;
  displayName: string;
  description: string;
  hidden: boolean;
  modules: string[];
  roles: string[];
  users: string[]; // Deprecated - use allowedUsers instead
  allowedUsers?: string[]; // Users explicitly allowed to access this profile
  restrictedUsers?: string[]; // Users explicitly denied access to this profile
  plugins?:string[];
  icons?:SVGIcon[];
  features?:Record<string,any>;
  helpUrl?:string
}

export enum ProfileType {
  Web = "web",
  External = "external",
}

export enum LogLevel {
  trace = "trace",
  debug = "debug",
  info = "info",
  warn = "warn",
  error = "error",
}

export enum ApmType {
  None = "None",
  Elastic = "Elastic",
}

export enum TagManagerType {
  None = "None",
  Google = "Google",
}

export class GoogleTagManagerConfig{
   /**
         * GTM id, must be something like GTM-000000.
         */
   gtmId: string;
   /**
    * Additional events such as 'gtm.start': new Date().getTime(),event:'gtm.js'.
    */
   events?: object | undefined;
   /**
    * Used to set environments.
    */
   auth?: string | undefined;
   /**
    * Used to set environments, something like env-00.
    */
   preview?: string | undefined;
}

export interface BuildManifest {
  buildId: string;
  version: string;
  environmentName: string;
  apmServiceName: string;
  apmServiceType: ApmType;
  tagManagerType: TagManagerType;
  tagManagerConfigs : string;
}

export interface AppManifest {
  default: string;
  logLevel?: LogLevel;
  profiles: Profile[];
}

export enum ManifestType {
  Manifest = "manifest",
  View = "view",
  InlineView = "inline-view",
  External = "external",
}

export interface DesktopProfile {
  hidden: boolean;
  appId: string;
  name: string;
  title: string;
  manifestType: ManifestType;
  description: string;
  manifest: string;
  icons?: [{ src: string }] | [];
  contactEmail: string;
  supportEmail: string;
  publisher: string;
  intents: any[];
  images?:
    | [
        {
          src: string;
        }
      ]
    | [];
  tags: string[];
}
