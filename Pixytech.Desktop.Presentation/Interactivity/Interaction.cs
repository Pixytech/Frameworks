using System;
using System.Windows;

namespace Pixytech.Desktop.Presentation.Interactivity
{
    public static class Interaction
    {
        private static readonly DependencyProperty BehaviorsProperty = DependencyProperty.RegisterAttached("AttachedShadowBehaviors", typeof(BehaviorCollection), typeof(Interaction), new FrameworkPropertyMetadata(OnBehaviorsChanged));
        internal static bool ShouldRunInDesignMode
        {
            get;
            set;
        }
      
        public static BehaviorCollection GetBehaviors(DependencyObject obj)
        {
            var behaviorCollection = (BehaviorCollection)obj.GetValue(BehaviorsProperty);
            if (behaviorCollection == null)
            {
                behaviorCollection = new BehaviorCollection();
                obj.SetValue(BehaviorsProperty, behaviorCollection);
            }
            return behaviorCollection;
        }

        private static void OnBehaviorsChanged(DependencyObject obj, DependencyPropertyChangedEventArgs args)
        {
            var behaviorCollection = (BehaviorCollection)args.OldValue;
            var behaviorCollection2 = (BehaviorCollection)args.NewValue;
            if (behaviorCollection != behaviorCollection2)
            {
                if (behaviorCollection != null && ((IAttachedObject)behaviorCollection).AssociatedObject != null)
                {
                    behaviorCollection.Detach();
                }
                if (behaviorCollection2 != null && obj != null)
                {
                    if (((IAttachedObject)behaviorCollection2).AssociatedObject != null)
                    {
                        throw new InvalidOperationException("An instance of a Behavior cannot be attached to more than one object at a time.");
                    }
                    behaviorCollection2.Attach(obj);
                }
            }
        }
       
        internal static bool IsElementLoaded(FrameworkElement element)
        {
            return element.IsLoaded;
        }
    }
}
