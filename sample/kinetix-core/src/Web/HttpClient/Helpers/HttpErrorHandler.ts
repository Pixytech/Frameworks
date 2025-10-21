import { HttpResponse } from "../Types/HttpResponse";

export abstract class HttpErrorHandler {
  public static throwIfNotOkResponse(response: HttpResponse): void {
    if (!response.ok) {
      throw response;
    }
  }
}
