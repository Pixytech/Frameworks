import { IUserPreferenceContext } from "..";
import { FxRateDateType } from "../FxRateDateType";

export const preference: IUserPreferenceContext = {
  currencySettings: {
    fxRateDateType: FxRateDateType.Current,
    reportingCCY: "CAD",
  },
};
