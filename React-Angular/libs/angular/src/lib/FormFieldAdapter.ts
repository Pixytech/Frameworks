import { Directive, Input, Output, EventEmitter, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { FormTextField } from '@mlp/core';
import { Subscription } from 'rxjs';

/**
 * Simple UI adapter for Angular form fields
 * Bridges the gap between Angular templates and MVVM ViewModels
 */
@Directive({
  selector: '[mlpFormField]',
  standalone: true
})
export class FormFieldAdapter implements OnInit, OnDestroy {
  @Input() field!: FormTextField;
  @Output() valueChange = new EventEmitter<string>();
  
  private subscription?: Subscription;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    if (this.field) {
      // Subscribe to field changes
      this.subscription = this.field.onModelChanged.subscribe(() => {
        this.updateElement();
      });
      
      // Set up element event listeners
      this.setupElementListeners();
      this.updateElement();
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private setupElementListeners(): void {
    const element = this.elementRef.nativeElement;
    
    // Input event
    element.addEventListener('input', (event: any) => {
      const target = event.target as any;
      this.field.setValue(target.value);
      this.valueChange.emit(target.value);
    });

    // Blur event
    element.addEventListener('blur', () => {
      this.field.updateModel((model: any) => {
        model.touched = true;
      });
    });

    // Focus event
    element.addEventListener('focus', () => {
      this.field.updateModel((model: any) => {
        model.visited = true;
      });
    });
  }

  private updateElement(): void {
    const element = this.elementRef.nativeElement;
    
    // Update value
    if (element.value !== this.field.model.value) {
      element.value = this.field.model.value || '';
    }

    // Update disabled state
    element.disabled = this.field.model.disabled;
    element.readOnly = this.field.model.readonly;

    // Update validation classes
    this.updateValidationClasses();
  }

  private updateValidationClasses(): void {
    const element = this.elementRef.nativeElement;
    const hasError = !this.field.model.valid && this.field.model.touched;
    
    // Remove existing validation classes
    element.classList.remove('ant-input-status-error', 'ant-input-status-warning');
    
    // Add appropriate validation class
    if (hasError) {
      element.classList.add('ant-input-status-error');
    }
  }
}

