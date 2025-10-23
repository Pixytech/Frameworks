import { Profile } from "@kinetix/core";

export class AppsModel {
  isLoading: boolean = false;
  applications: Profile[] = [];
  isInBrowser: boolean;
  PlatformMessage: string;
  DesktopPlatformInstalled: boolean;
}
