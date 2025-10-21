import { HttpRequestConfigurations } from "../Types/HttpRequestConfigurations";
import { HttpRequest } from "../Types/HttpRequest";

export class RequestMapper {
  public static for(request: HttpRequest, method: HttpRequestConfigurations): RequestInit {
    return {
      cache: request.cache,
      mode: request.mode,
      credentials: request.credentials,
      headers: request.headers,
      redirect: request.redirect,
      referrer: request.referrer,
      method: method,
      body: method !== HttpRequestConfigurations.GET ? JSON.stringify(request.body) : null,
    };
  }
}
