import { Observable } from "rxjs";
import { FormModel, IFormViewModel } from "../../../Forms";
import { IBlotter } from "../..";

export interface IConfigurationEditorPage {
  Owner: IConfigurationEditor;
  readonly onConfigurationChanged: Observable<void>;
}

export interface IConfigurationEditor extends IFormViewModel<FormModel> {
  blotter: IBlotter;
}
