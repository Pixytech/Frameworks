using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq.Expressions;
using System.Runtime.CompilerServices;
using Pixytech.Core;
using Pixytech.Desktop.Presentation.Infrastructure.Helpers;
using System.Threading.Tasks;

namespace Pixytech.Desktop.Presentation.Infrastructure
{
    public abstract class ViewModelBase : INotifyPropertyChanged
    {
        private readonly PropertyContainer _propertyContainer = new PropertyContainer();

        protected IEnumerable<string> PropertyNames
        {
            get { return _propertyContainer.PropertyNames; }
        }

        protected virtual T GetProperty<T>(T defaultValue = default(T), [CallerMemberName] string propertyName = "")
        {
            return _propertyContainer.Get(defaultValue, propertyName);
        }

        protected virtual bool SetProperty<T>(T value, [CallerMemberName] string propertyName = "")
        {
            return Set(value, true, propertyName);
        }

        protected virtual bool SetProperty<T>(T value, bool autoNotify, [CallerMemberName] string propertyName = "")
        {
            return Set(value, autoNotify, propertyName);
        }

        private bool Set<T>(T value, bool autoNotify,string propertyName)
        {
            if (_propertyContainer.Set(value, propertyName))
            {
                if (autoNotify)
                {
                    OnPropertyChanged(propertyName);
                }

                return true;
            }

            return false;
        }

        /// <summary>
        /// Notifies listeners that a property value has changed.
        /// </summary>
        /// <param name="propertyName">Name of the property used to notify listeners. This
        /// value is optional and can be provided automatically when invoked from compilers
        /// that support <see cref="CallerMemberNameAttribute"/>.</param>
        protected void OnPropertyChanged(string propertyName)
        {
            var eventHandler = PropertyChanged;
            if (eventHandler != null)
            {
                eventHandler(this, new PropertyChangedEventArgs(propertyName));
            }
        }

        /// <summary>
        /// Raises this object's PropertyChanged event.
        /// </summary>
        /// <typeparam name="T">The type of the property that has a new value</typeparam>
        /// <param name="propertyExpression">A Lambda expression representing the property that has a new value.</param>
        protected void OnPropertyChanged<T>(Expression<Func<T>> propertyExpression)
        {
            var propertyName = PropertySupport.ExtractPropertyName(propertyExpression);
            OnPropertyChanged(propertyName);
        }

        public event PropertyChangedEventHandler PropertyChanged;
        private bool _isInitialize;

        public async Task Initialize()
        {
            if (!_isInitialize)
            {
                _isInitialize = true;
                await OnInitialize();
            }
        }

        protected async virtual Task OnInitialize()
        {
            await Task.Run(() => { });
        }

        public void Cleanup()
        {
            if (_isInitialize)
            {
                _isInitialize = false;
                OnCleanup();
            }
        }

        protected virtual void OnCleanup()
        {
            
        }
    }
}
