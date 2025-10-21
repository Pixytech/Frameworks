
import { type IAuthenticationService, IAuthenticationServiceType } from "../../Auth";
import { BuildManifest } from "../../Components/AppManifest";
import { IocInject } from "../../IoC";
import { ITagAdapter } from "../ITagAdapter";

export class DefaultTagAdapter implements ITagAdapter
{
    name: string = "default";
    authenticationService: IAuthenticationService;
    
    
    constructor(@IocInject(IAuthenticationServiceType) authenticationService: IAuthenticationService) 
  {
    this.authenticationService = authenticationService;
  }
  
    async initialize(
        profile: string,
        buildInfo: Partial<BuildManifest>,
      ): Promise<void> {
        console.debug("initialized Default Tag adapter", profile, buildInfo);
        const header = {
            id: this.authenticationService.GetUserId(),
            username: this.authenticationService.GetUsername(),
            environment: buildInfo.environmentName,
            app : profile,
            token:this.authenticationService.GetParsedToken()
          };
          console.debug(`Tag:initialize`,header);
      }
      
    createEvent(eventName: string, data: any): void {
        console.debug(`Tag:${eventName}`,data);
    }

}