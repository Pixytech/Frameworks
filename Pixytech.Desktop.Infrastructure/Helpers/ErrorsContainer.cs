using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using Pixytech.Core;

namespace Pixytech.Desktop.Presentation.Infrastructure.Helpers
{
    public class ErrorsContainer<T>
    {
        private static readonly T[] NoErrors = new T[0];

        private readonly Action<string> _raiseErrorsChanged;

        protected readonly Dictionary<string, IList<T>> ValidationResults;

        public bool HasErrors
        {
            get
            {
                return ValidationResults.Count != 0;
            }
        }

        public ErrorsContainer(Action<string> raiseErrorsChanged)
        {
            if (raiseErrorsChanged == null)
            {
                throw new ArgumentNullException("raiseErrorsChanged");
            }
            _raiseErrorsChanged = raiseErrorsChanged;
            ValidationResults = new Dictionary<string, IList<T>>();
        }

        public IEnumerable<T> GetErrors(string propertyName)
        {
            string key = propertyName ?? string.Empty;
            IList<T> result;
            if (ValidationResults.TryGetValue(key, out result))
            {
                return result;
            }
            return NoErrors;
        }

        public void ClearErrors<TProperty>(Expression<Func<TProperty>> propertyExpression)
        {
            string propertyName = PropertySupport.ExtractPropertyName(propertyExpression);
            ClearErrors(propertyName);
        }

        public void ClearErrors()
        {
            ValidationResults.Clear();
        }

        public void ClearErrors(string propertyName)
        {
            SetErrors(propertyName, new List<T>());
        }

        public void SetErrors<TProperty>(Expression<Func<TProperty>> propertyExpression, IEnumerable<T> propertyErrors)
        {
            string propertyName = PropertySupport.ExtractPropertyName(propertyExpression);
            SetErrors(propertyName, propertyErrors);
        }

        public void SetErrors(string propertyName, IEnumerable<T> newValidationResults)
        {
            string text = propertyName ?? string.Empty;
            bool flag = ValidationResults.ContainsKey(text);
            var validationResults = newValidationResults as IList<T> ?? newValidationResults.ToList();
            bool flag2 = newValidationResults != null && validationResults.Any();
            if (flag || flag2)
            {
                if (flag2)
                {
                    ValidationResults[text] = validationResults;
                    _raiseErrorsChanged(text);
                    return;
                }
                ValidationResults.Remove(text);
                _raiseErrorsChanged(text);
            }
        }
    }
}
