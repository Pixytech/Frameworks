using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq.Expressions;
using System.Runtime.CompilerServices;
using Pixytech.Core;
using Pixytech.Desktop.Presentation.Infrastructure.Helpers;

namespace Pixytech.Desktop.Presentation.Infrastructure
{
    public abstract class ValidatableViewModelBase : ViewModelBase, INotifyDataErrorInfo
    {
        private readonly ErrorsContainer<ValidationResult> _errorsContainer;

        protected ValidatableViewModelBase()
        {
            _errorsContainer = new ErrorsContainer<ValidationResult>(RaiseErrorsChanged);
        }

        public event EventHandler<DataErrorsChangedEventArgs> ErrorsChanged;

        public bool HasErrors
        {
            get
            {
                return _errorsContainer.HasErrors;
            }
        }

        public IEnumerable GetErrors(string propertyName)
        {
            return _errorsContainer.GetErrors(propertyName);
        }

        public bool ValidateProperty<T>(T value, Expression<Func<T>> propertyExpression)
        {
            var propertyName = PropertySupport.ExtractPropertyName(propertyExpression);
            return ValidatePropertyInternal(value, propertyName);
        }

        public bool Validate()
        {
            var results = new List<ValidationResult>();
            _errorsContainer.ClearErrors();
            var isValid = OnValidate(results);
            UpdateValidationResults(results);
            RaiseErrorsChangedAll();
            return isValid;
        }

        protected virtual bool OnValidate(ICollection<ValidationResult> validationResults)
        {
            return Validator.TryValidateObject(this, new ValidationContext(this, null, null), validationResults, true);
        }

        protected virtual bool OnValidateProperty(string propertyName, object value, ICollection<ValidationResult> validationResults)
        {
            return Validator.TryValidateProperty(value, new ValidationContext(this) { MemberName = propertyName }, validationResults);
        }

        protected bool ValidateProperty<T>(T value, [CallerMemberName] string propertyName = "")
        {
            return ValidatePropertyInternal(value, propertyName);
        }

        protected bool ValidatePropertyInternal<T>(T value, string propertyName)
        {
            var results = new List<ValidationResult>();
            _errorsContainer.ClearErrors(propertyName);
            var isValid = OnValidateProperty(propertyName, value, results);
            UpdateValidationResults(results);
            return isValid;
        }

        protected void RaiseErrorsChangedAll()
        {
            foreach (var propertyName in PropertyNames)
            {
                RaiseErrorsChangedInternal(propertyName);
            }
        }

        private void RaiseErrorsChangedInternal(string propertyName)
        {
            var handler = ErrorsChanged;
            if (handler != null)
            {
                handler(this, new DataErrorsChangedEventArgs(propertyName));
            }
        }

        protected void RaiseErrorsChanged([CallerMemberName] string propertyName = "")
        {
            RaiseErrorsChangedInternal(propertyName);
        }

        private void UpdateValidationResults(List<ValidationResult> validationResults)
        {
            var errors = new Dictionary<string, List<ValidationResult>>();

            validationResults.ForEach(
                m =>
                {
                    foreach (var propertyName in m.MemberNames)
                    {
                        if (errors.ContainsKey(propertyName))
                        {
                            errors[propertyName].Add(new ValidationResult(m.ErrorMessage));
                        }
                        else
                        {
                            errors.Add(propertyName, new List<ValidationResult> { new ValidationResult(m.ErrorMessage) });
                        }
                    }
                });

            foreach (var pair in errors)
            {
                _errorsContainer.ClearErrors(pair.Key);
                _errorsContainer.SetErrors(pair.Key, pair.Value);
            }
        }
    }
}
