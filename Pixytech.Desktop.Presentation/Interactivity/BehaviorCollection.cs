using System.Windows;

namespace Pixytech.Desktop.Presentation.Interactivity
{
    public sealed class BehaviorCollection : AttachableCollection<Behavior>
    {
        internal BehaviorCollection()
        {
        }
        protected override void OnAttached()
        {
            foreach (Behavior current in this)
            {
                current.Attach(base.AssociatedObject);
            }
        }
        protected override void OnDetaching()
        {
            foreach (Behavior current in this)
            {
                current.Detach();
            }
        }
        internal override void ItemAdded(Behavior item)
        {
            if (base.AssociatedObject != null)
            {
                item.Attach(base.AssociatedObject);
            }
        }
        internal override void ItemRemoved(Behavior item)
        {
            if (((IAttachedObject)item).AssociatedObject != null)
            {
                item.Detach();
            }
        }
        protected override Freezable CreateInstanceCore()
        {
            return new BehaviorCollection();
        }
    }
}
