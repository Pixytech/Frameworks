using System;
using System.Globalization;
using System.Windows;
using System.Windows.Media.Animation;

namespace Pixytech.Desktop.Presentation.Interactivity
{
    public abstract class Behavior : Animatable, IAttachedObject
    {
        private readonly Type _associatedType;
        private DependencyObject _associatedObject;
        internal event EventHandler AssociatedObjectChanged;
        protected Type AssociatedType
        {
            get
            {
                ReadPreamble();
                return _associatedType;
            }
        }
        protected DependencyObject AssociatedObject
        {
            get
            {
                ReadPreamble();
                return _associatedObject;
            }
        }
        DependencyObject IAttachedObject.AssociatedObject
        {
            get
            {
                return AssociatedObject;
            }
        }
        internal Behavior(Type associatedType)
        {
            _associatedType = associatedType;
        }
        protected virtual void OnAttached()
        {
        }
        protected virtual void OnDetaching()
        {
        }
        protected override Freezable CreateInstanceCore()
        {
            Type type = GetType();
            return (Freezable)Activator.CreateInstance(type);
        }
        private void OnAssociatedObjectChanged()
        {
            if (AssociatedObjectChanged != null)
            {
                AssociatedObjectChanged(this, new EventArgs());
            }
        }
        public void Attach(DependencyObject dependencyObject)
        {
            if (dependencyObject != AssociatedObject)
            {
                if (AssociatedObject != null)
                {
                    throw new InvalidOperationException("An instance of a Behavior cannot be attached to more than one object at a time.");
                }
                if (dependencyObject != null && !AssociatedType.IsAssignableFrom(dependencyObject.GetType()))
                {
                    throw new InvalidOperationException(string.Format(CultureInfo.CurrentCulture, "Cannot attach type {0} to type {1}. Instances of type {0} can only be attached to objects of type {2}.", new object[]
					{
						GetType().Name,
						dependencyObject.GetType().Name,
						AssociatedType.Name
					}));
                }
                WritePreamble();
                _associatedObject = dependencyObject;
                WritePostscript();
                OnAssociatedObjectChanged();
                OnAttached();
            }
        }
        public void Detach()
        {
            OnDetaching();
            WritePreamble();
            _associatedObject = null;
            WritePostscript();
            OnAssociatedObjectChanged();
        }
    }
}
