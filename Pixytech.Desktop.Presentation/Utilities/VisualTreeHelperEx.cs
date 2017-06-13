using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Media;

namespace Pixytech.Desktop.Presentation.Utilities
{
    public static class VisualTreeHelperEx
    {
        public static DependencyObject FindAncestorByType(DependencyObject element, Type type, bool specificTypeOnly)
        {
            if (element == null)
            {
                return null;
            }
            if (specificTypeOnly ? (element.GetType() == type) : (element.GetType() == type || element.GetType().IsSubclassOf(type)))
            {
                return element;
            }
            return VisualTreeHelperEx.FindAncestorByType(VisualTreeHelper.GetParent(element), type, specificTypeOnly);
        }

        public static T FindAncestorByType<T>(DependencyObject depObj) where T : DependencyObject
        {
            if (depObj == null)
            {
                return default(T);
            }
            if (depObj is T)
            {
                return (T)((object)depObj);
            }
            return VisualTreeHelperEx.FindAncestorByType<T>(VisualTreeHelper.GetParent(depObj));
        }

        public static Visual FindDescendantByName(Visual element, string name)
        {
            if (element != null && element is FrameworkElement && (element as FrameworkElement).Name == name)
            {
                return element;
            }
            Visual visual = null;
            if (element is FrameworkElement)
            {
                (element as FrameworkElement).ApplyTemplate();
            }
            for (int i = 0; i < VisualTreeHelper.GetChildrenCount(element); i++)
            {
                visual = VisualTreeHelperEx.FindDescendantByName(VisualTreeHelper.GetChild(element, i) as Visual, name);
                if (visual != null)
                {
                    break;
                }
            }
            return visual;
        }

        public static Visual FindDescendantByType(Visual element, Type type)
        {
            return VisualTreeHelperEx.FindDescendantByType(element, type, true);
        }

        public static Visual FindDescendantByType(Visual element, Type type, bool specificTypeOnly)
        {
            if (element == null)
            {
                return null;
            }
            if (specificTypeOnly ? (element.GetType() == type) : (element.GetType() == type || element.GetType().IsSubclassOf(type)))
            {
                return element;
            }
            Visual visual = null;
            if (element is FrameworkElement)
            {
                (element as FrameworkElement).ApplyTemplate();
            }
            for (int i = 0; i < VisualTreeHelper.GetChildrenCount(element); i++)
            {
                visual = VisualTreeHelperEx.FindDescendantByType(VisualTreeHelper.GetChild(element, i) as Visual, type, specificTypeOnly);
                if (visual != null)
                {
                    break;
                }
            }
            return visual;
        }

        public static T FindDescendantByType<T>(Visual element) where T : Visual
        {
            return (T)((object)VisualTreeHelperEx.FindDescendantByType(element, typeof(T)));
        }

        public static Visual FindDescendantWithPropertyValue(Visual element, DependencyProperty dp, object value)
        {
            if (element == null)
            {
                return null;
            }
            if (element.GetValue(dp).Equals(value))
            {
                return element;
            }
            Visual visual = null;
            if (element is FrameworkElement)
            {
                (element as FrameworkElement).ApplyTemplate();
            }
            for (int i = 0; i < VisualTreeHelper.GetChildrenCount(element); i++)
            {
                visual = VisualTreeHelperEx.FindDescendantWithPropertyValue(VisualTreeHelper.GetChild(element, i) as Visual, dp, value);
                if (visual != null)
                {
                    break;
                }
            }
            return visual;
        }
    }
}
