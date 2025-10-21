import { ValidationType } from "./ValidationType";

export class ValidationHelper {
  public static setValidation(message: string, type: ValidationType) {
    return `${type.toString()}${message}`;
  }

  public static getValidation(message: string | null): {
    message: string;
    type: ValidationType;
  } {
    if (message) {
      if (message.startsWith(ValidationType.Info.toString())) {
        return {
          message: message.substring(ValidationType.Info.toString().length),
          type: ValidationType.Info,
        };
      } else if (message.startsWith(ValidationType.Error.toString())) {
        return {
          message: message.substring(ValidationType.Error.toString().length),
          type: ValidationType.Error,
        };
      } else if (message.startsWith(ValidationType.Warning.toString())) {
        return {
          message: message.substring(ValidationType.Warning.toString().length),
          type: ValidationType.Warning,
        };
      } else {
        return { message: message, type: ValidationType.Default };
      }
    }
    return { message: "", type: ValidationType.Default };
  }

  public static getValidationClass(type: ValidationType): string {
    switch (type) {
      case ValidationType.Warning:
        return "k-i-warning validation-warning";
      case ValidationType.Error:
        return "k-i-error validation-error";
    }
    return "k-i-info validation-info";
  }
}
