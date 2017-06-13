using System.Windows;

namespace Pixytech.Desktop.Presentation.Interactivity
{
    public abstract class Behavior<T> : Behavior where T : DependencyObject
    {
        protected new T AssociatedObject
        {
            get
            {
                return (T)((object)base.AssociatedObject);
            }
        }
        protected Behavior()
            : base(typeof(T))
        {
        }
    }
}
