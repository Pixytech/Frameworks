import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import type { FormTextField } from '@mlp/core';

@Component({
  selector: 'mlp-form-text-box',
  template: `
    <nz-form-item>
      <nz-form-label *ngIf="dataContext.label" [nzRequired]="dataContext.required">
        {{ dataContext.label }}
      </nz-form-label>
      <nz-form-control 
        [nzValidateStatus]="!dataContext.model.valid && dataContext.model.touched ? 'error' : ''"
        [nzErrorTip]="!dataContext.model.valid && dataContext.model.touched ? dataContext.model.validationMessage : ''"
        [nzExtra]="dataContext.model.customValidation">
        <input
          nz-input
          [placeholder]="dataContext.placeholder"
          [disabled]="dataContext.model.disabled"
          [nzSize]="size"
          [value]="dataContext.value"
          (input)="onInputChange($event)"
          (blur)="onBlur()"
          (focus)="onFocus()"
          [attr.maxlength]="dataContext.maxLength"
          #inputRef>
      </nz-form-control>
    </nz-form-item>
  `,
  styles: [],
  standalone: true,
  imports: [NzInputModule, NzFormModule, CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormTextBoxComponent),
      multi: true
    }
  ]
})
export class FormTextBoxComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() dataContext!: FormTextField;
  @Input() size: 'small' | 'middle' | 'large' = 'middle';
  
  @Output() valueChange = new EventEmitter<string>();
  @Output() validationChange = new EventEmitter<boolean>();

  private subscription?: Subscription;
  private onChange = (value: string) => {};
  private onTouched = () => {};

  ngOnInit(): void {
    if (this.dataContext) {
      // Subscribe to ViewModel changes
      this.subscription = this.dataContext.onModelChanged.subscribe(() => {
        // Trigger Angular change detection
        this.onChange(this.dataContext.value);
        this.valueChange.emit(this.dataContext.value);
        this.validationChange.emit(this.dataContext.model.valid);
      });
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onInputChange(event: Event): void {
    const target = event.target as any;
    const value = target.value;
    
    if (this.dataContext) {
      this.dataContext.setValue(value);
    }
  }

  onBlur(): void {
    if (this.dataContext) {
      this.dataContext.updateModel((model: any) => {
        model.touched = true;
      });
    }
    this.onTouched();
  }

  onFocus(): void {
    // Handle focus if needed
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    if (this.dataContext && this.dataContext.value !== value) {
      this.dataContext.setValue(value || '');
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (this.dataContext) {
      this.dataContext.updateModel((model: any) => {
        model.disabled = isDisabled;
      });
    }
  }
}

// Note: createFormTextBox factory function is exported from @mlp/core
