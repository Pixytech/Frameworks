import { ApiResponseType, AuthenticationService } from "@kinetix/core";

/**
 * @deprecated The method should not be used. Use the new api client instead.
 */
export const api = async (endpoint: any, args?: any, responseType?: ApiResponseType) => {
  if (AuthenticationService.Instance.IsLoggedIn()) {
    let token = AuthenticationService.Instance.GetParsedToken();
    if (args) {
      if (args.headers) {
        args.headers.AuthToken = token?.jti;
      } else {
        args.headers = { AuthToken: token?.jti };
      }
    } else {
      args = {
        headers: {
          AuthToken: token?.jti,
        },
      };
    }

    const response = await fetch(`/api${endpoint}`, args);
    if (!responseType) {
      responseType = ApiResponseType.Json;
    }

    const body = await getBody(responseType, response);
    if (response.status >= 200 && response.status < 300) {
      return body;
    }

    if (body.status === "Failure") {
      throw new Error(`${body.description}`);
    }
    throw new Error(`Request failed ${response.status} ${response.statusText}`);
  }
  throw new Error(`User is not Logged in!`);
};
async function getBody(responseType: ApiResponseType, response: Response): Promise<any> {
  switch (responseType) {
    case ApiResponseType.Json:
      return await response.json();
    case ApiResponseType.Binary:
      return await response.blob();
    case ApiResponseType.Text:
      return await response.text();
  }
}
