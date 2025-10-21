import { using, ViewModelBase } from "@kinetix/core";
import { FieldRenderProps, FieldValidatorType } from "@progress/kendo-react-form";
import { debounce, get } from "lodash";
import { MutableRefObject } from "react";
import { Observable, Subject, Subscription } from "rxjs";
import { DataTypes } from "../../Data";
import { FormModel } from "../FormModel";
import { IFormViewModel } from "../IFormViewModel";
import { IFieldModelBase } from "./FieldModelBase";
import { IFieldValidator } from "./IFieldValidator";
import { IFormField } from "./IFormField";
import { UpdateSourceTrigger } from "./UpdateSourceTrigger";
import { ValidationHelper } from "./ValidationHelper";
import { ValidationType } from "./ValidationType";
import { CustomValidator } from "./Validators/CustomValidator";
import { RequiredValidator } from "./Validators/RequiredValidator";

export abstract class FormField<FieldType extends IFieldModelBase> extends ViewModelBase<FieldType> implements IFormField {
  private readonly focusChangeSubject: Subject<void> = new Subject<void>();
  
  public readonly onFocusChanged: Observable<void>;
  public readonly type: string = "IFormField";
  private focusChangeSubscription: Subscription;

  protected readonly notifyModelChangedDebounced = debounce(() => {
    this.notifyModelChanged();
  }, 200);

  renderIndex: number = -1;
  label: any;
  placeholder?: string;
  validators: IFieldValidator[] = [];
  Owner: IFormViewModel<FormModel>;

  private _metaPath: string;
  hasfocus: boolean = false;
  public get metaPath(): string {
    return this._metaPath;
  }

  fieldType: DataTypes;
  fieldRenderRef:
    | {
        onChange: (event: { target?: any; value?: any }) => void;
        onBlur: () => void;
        onFocus: () => void;
      }
    | undefined;
  protected fieldEvents: {
    onChange: (event: { target?: any; value?: any }) => void;
    onBlur: () => void;
    onFocus: () => void;
  } = {
    onChange: (e) => {
      using(this.SuspendNotifications(), () => this.updateModel((m) => (m.customValidation = null)));
      if (this.fieldRenderRef && !(this.model.readonly || this.Owner?.model.readonly)) {
        this.fieldRenderRef.onChange(e);
      }
    },
    onBlur: () => {
      if (this.fieldRenderRef && !(this.model.readonly || this.Owner?.model.readonly)) {
        this.fieldRenderRef.onBlur();
      }
    },
    onFocus: () => {
      if (this.fieldRenderRef && !(this.model.readonly || this.Owner?.model.readonly)) {
        this.fieldRenderRef.onFocus();
      }
    },
  };

  constructor(owner?: IFormViewModel<FormModel>) {
    super();
    if (owner) {
      this.Owner = owner;
    }
    this.onFocusChanged = this.focusChangeSubject.asObservable();
  }
 
  getSubmitValue(): any {
    return this.model.value;
  }
  name: string;
  subscribeFocusChange(source: MutableRefObject<any>): Subscription {
    if (this.focusChangeSubscription) {
      this.focusChangeSubscription.unsubscribe();
    }
    this.focusChangeSubscription = this.onFocusChanged.subscribe((e) => {
     this.focusTarget(source);
     this.selectTarget(source);
    });

    return this.focusChangeSubscription;
  }

  focusTarget(source:MutableRefObject<any>){
    if (source?.current?.select) {
      source.current.select();
    }else if(source?.current?.element?.select){
      source.current.element.select();
    }
  }

  selectTarget(source:MutableRefObject<any>){
    if (source?.current?.focus) {
      source.current.focus();
    }else if(source?.current?.element?.focus){
      source.current.element.focus();
    }
  }

  handleTabNavigation: boolean = true;
  setCustomValidation(type: ValidationType, message: string): void {
    this.updateModel((m) => (m.customValidation = `${ValidationHelper.setValidation(message, type)}`));
  }

  mapDomainModel(dataModelPath: string, metaModelPath?: string): void {
    this.name = dataModelPath;
    this._metaPath = metaModelPath ? metaModelPath : dataModelPath;
  }

  onFocus(): void {
    this.hasfocus = true;
    this.fieldEvents.onFocus();
  }

  onKeyDown(e: React.KeyboardEvent<Element>): void {
    if (this.handleTabNavigation) {
      if (e.key === "Tab") {
        if (!e.shiftKey) {
          if (this.Owner?.moveToNextField(this.renderIndex)) {
            e.preventDefault();
            e.stopPropagation();
          }
        }
      }
    }
  }

  focus(): void {
    this.focusChangeSubject.next();
  }

  setValidators(): void {
    this.validators.push(new RequiredValidator());
    this.validators.push(new CustomValidator());
    this.notifyModelChanged();
  }

  getValidators(): FieldValidatorType[] | undefined {
    const fieldValidators = this.validators.map((validator) => {
      const kendoValidator: FieldValidatorType = (value: any) => {
        return validator.validate(value, this);
      };
      return kendoValidator;
    });

    const validators = fieldValidators;
    const componentValidation = validators.length > 0 ? validators : undefined;

    return componentValidation;
  }

  onFieldRender(fieldRenderProps: FieldRenderProps) {
    this.fieldRenderRef = {
      onChange: fieldRenderProps.onChange,
      onBlur: fieldRenderProps.onBlur,
      onFocus: fieldRenderProps.onFocus,
    };

    if (this.renderIndex < 0) {
      this.renderIndex = this.Owner?.getFieldIndex(this);
    }
    using(this.SuspendNotifications(), () => {
      this.updateModel((m) => {
        m.modified = fieldRenderProps.modified;
        m.touched = fieldRenderProps.touched;
        m.valid = fieldRenderProps.valid;
        m.visited = fieldRenderProps.visited;
        m.validationMessage = fieldRenderProps.validationMessage;
      });
    });
  }

  setMetaData(fieldMeta: any): void {
    this.fieldType = fieldMeta.fieldType;
    if (fieldMeta.mandatory) {
      this.model.required = fieldMeta.mandatory;
    }

    const mandatoryConstraint = get(fieldMeta, "constraints", []).find((x: any) => x.type === "mandatory");
    if (mandatoryConstraint) {
      this.model.allowEmpty = mandatoryConstraint.allowEmpty;
    }
    this.onMetaData();
  }

  onMetaData(): void {}

  pendingChangedCommit: boolean = false;
  protected abstract createModel(): FieldType;

  public updateSourceTrigger: UpdateSourceTrigger = UpdateSourceTrigger.LostFocus;

  public onLostFocus(): void {
    this.hasfocus = false;
    if (this.updateSourceTrigger === UpdateSourceTrigger.LostFocus && this.pendingChangedCommit) {
      this.notifyModelChanged();
    }
    this.pendingChangedCommit = false;
    this.fieldEvents.onBlur();
  }

  public setValue(value: any): void {
    this.pendingChangedCommit = true;
    if (this.hasfocus) {
      if (this.updateSourceTrigger === UpdateSourceTrigger.PropertyChanged) {
        using(this.SuspendNotifications(), () => {
          this.updateModel((m) => {
            m.value = value;
            m.customValidation = null;
          });
        });
        this.notifyModelChangedDebounced();
      } else {
        using(this.SuspendNotifications(), () => {
          this.updateModel((m) => {
            m.value = value;
            m.customValidation = null;
          });
        });
      }
    } else {
      this.updateModel((m) => {
        m.value = value;
        m.customValidation = null;
      });
    }
    this.fieldEvents.onChange({ value: this.model.value });
  }
}
