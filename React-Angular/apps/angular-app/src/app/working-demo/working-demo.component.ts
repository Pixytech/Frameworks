import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { createNameField, createEmailField, createPasswordField, isFormValid, touchAllFields, FormTextField } from '@mlp/core';

@Component({
  selector: 'app-working-demo',
  standalone: true,
  imports: [
    CommonModule,
    NzInputModule,
    NzFormModule,
    NzButtonModule,
    NzCardModule
  ],
  template: `
    <div style="padding: 20px; max-width: 600px; margin: 0 auto;">
      <h1>🚀 Working MVVM Demo</h1>
      <p>Simple Ant Design + MVVM implementation</p>
      
      <nz-card title="Form Demo" style="margin-bottom: 20px;">
        <nz-form-item>
          <nz-form-label [nzRequired]="nameField.model.required">
            {{ nameField.label }}
          </nz-form-label>
          <nz-form-control>
            <input
              nz-input
              [placeholder]="nameField.placeholder"
              [value]="nameField.model.value"
              [disabled]="nameField.model.disabled"
              (input)="onNameChange($event)"
              (blur)="onNameBlur()">
          </nz-form-control>
        </nz-form-item>

        <nz-form-item>
          <nz-form-label [nzRequired]="emailField.model.required">
            {{ emailField.label }}
          </nz-form-label>
          <nz-form-control>
            <input
              nz-input
              [placeholder]="emailField.placeholder"
              [value]="emailField.model.value"
              [disabled]="emailField.model.disabled"
              (input)="onEmailChange($event)"
              (blur)="onEmailBlur()">
          </nz-form-control>
        </nz-form-item>

        <nz-form-item>
          <nz-form-label [nzRequired]="passwordField.model.required">
            {{ passwordField.label }}
          </nz-form-label>
          <nz-form-control>
            <input
              nz-input
              type="password"
              [placeholder]="passwordField.placeholder"
              [value]="passwordField.model.value"
              [disabled]="passwordField.model.disabled"
              (input)="onPasswordChange($event)"
              (blur)="onPasswordBlur()">
          </nz-form-control>
        </nz-form-item>

        <div style="margin-top: 20px;">
          <button
            nz-button
            nzType="primary"
            [disabled]="!isFormValid()"
            (click)="submitForm()"
            style="margin-right: 10px;">
            Submit
          </button>
          <button
            nz-button
            (click)="resetForm()">
            Reset
          </button>
        </div>
      </nz-card>

      <nz-card title="Form State">
        <p><strong>Name:</strong> {{ nameField.model.value }}</p>
        <p><strong>Email:</strong> {{ emailField.model.value }}</p>
        <p><strong>Password:</strong> {{ passwordField.model.value }}</p>
        <p><strong>Form Valid:</strong> {{ isFormValid() }}</p>
        <p><strong>Name Touched:</strong> {{ nameField.model.touched }}</p>
        <p><strong>Email Touched:</strong> {{ emailField.model.touched }}</p>
        <p><strong>Password Touched:</strong> {{ passwordField.model.touched }}</p>
      </nz-card>
    </div>
  `,
  styles: []
})
export class WorkingDemoComponent implements OnInit {
  nameField!: FormTextField;
  emailField!: FormTextField;
  passwordField!: FormTextField;

  ngOnInit(): void {
    this.nameField = createNameField();
    this.emailField = createEmailField();
    this.passwordField = createPasswordField();
  }

  onNameChange(event: any): void {
    this.nameField.setValue(event.target.value);
  }

  onNameBlur(): void {
    this.nameField.model.touched = true;
  }

  onEmailChange(event: any): void {
    this.emailField.setValue(event.target.value);
  }

  onEmailBlur(): void {
    this.emailField.model.touched = true;
  }

  onPasswordChange(event: any): void {
    this.passwordField.setValue(event.target.value);
  }

  onPasswordBlur(): void {
    this.passwordField.model.touched = true;
  }

  isFormValid(): boolean {
    return isFormValid(this.nameField, this.emailField, this.passwordField);
  }

  submitForm(): void {
    touchAllFields(this.nameField, this.emailField, this.passwordField);
    if (this.isFormValid()) {
      alert(`Form Submitted!
        Name: ${this.nameField.model.value}
        Email: ${this.emailField.model.value}
        Password: ${this.passwordField.model.value}`);
    } else {
      alert('Please correct the form errors.');
    }
  }

  resetForm(): void {
    this.nameField.model.value = '';
    this.emailField.model.value = '';
    this.passwordField.model.value = '';
    this.nameField.model.touched = false;
    this.emailField.model.touched = false;
    this.passwordField.model.touched = false;
  }
}

