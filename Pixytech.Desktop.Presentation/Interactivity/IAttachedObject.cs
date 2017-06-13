using System.Windows;

namespace Pixytech.Desktop.Presentation.Interactivity
{
    public interface IAttachedObject
    {
        DependencyObject AssociatedObject
        {
            get;
        }
        void Attach(DependencyObject dependencyObject);
        void Detach();
    }
}
