export interface FieldContext<T> {
  key: string;
  value: T;
}

export class AutomationHelper {
  public static GetId(text: string): string {
    return text.replaceAll(/[^a-zA-Z0-9]/g, "-");
  }

  public static GetIdForLabel(text: string): FieldContext<string> {
    let res: FieldContext<string> = {
      key: "data-automationid",
      value: AutomationHelper.GetId(text),
    };
    return res;
  }

  public static GetValidationIconIdForLabel(
    text: string
  ): FieldContext<string> {
    let res: FieldContext<string> = {
      key: "data-validationError",
      value: AutomationHelper.GetId(text),
    };
    return res;
  }

  public static GetValidationTootipIdForLabel(
    text: string
  ): FieldContext<string> {
    let res: FieldContext<string> = {
      key: "data-validation",
      value: AutomationHelper.GetId(text),
    };
    return res;
  }
}
