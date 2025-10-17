import { Directive, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { UserRegistrationFormViewModel } from '@mlp/core';
import { Subscription } from 'rxjs';

/**
 * Simple UI adapter for Angular forms
 * Provides form-level operations and state management
 */
@Directive({
  selector: '[mlpForm]',
  standalone: true
})
export class FormAdapter implements OnInit, OnDestroy {
  @Input() viewModel!: UserRegistrationFormViewModel;
  @Output() submit = new EventEmitter<void>();
  @Output() reset = new EventEmitter<void>();
  
  private subscription?: Subscription;

  ngOnInit(): void {
    if (this.viewModel) {
      // Subscribe to form model changes
      this.subscription = this.viewModel.onModelChanged.subscribe(() => {
        // Form state changes are handled by the template bindings
      });
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  async onSubmit(): Promise<void> {
    this.viewModel.touchAllFields();
    if (this.viewModel.isFormValid()) {
      await this.viewModel.submit();
      this.submit.emit();
    }
  }

  onReset(): void {
    this.viewModel.reset();
    this.reset.emit();
  }

  // Helper methods for template bindings
  get isSubmitting(): boolean {
    return this.viewModel.model.isSubmitting;
  }

  get allowSubmit(): boolean {
    return this.viewModel.model.allowSubmit;
  }

  get customValidation(): string | undefined {
    return this.viewModel.model.customValidation;
  }

  get errorMessage(): string | undefined {
    return this.viewModel.model.errorMessage;
  }
}

