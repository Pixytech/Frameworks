using System;
using System.Collections;
using System.Collections.ObjectModel;
using System.Collections.Specialized;
using System.ComponentModel;
using System.Diagnostics;
using System.Globalization;
using System.Windows;

namespace Pixytech.Desktop.Presentation.Interactivity
{
    public abstract class AttachableCollection<T> : FreezableCollection<T>, IAttachedObject where T : DependencyObject, IAttachedObject
    {
        private Collection<T> _snapshot;
        private DependencyObject _associatedObject;
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
        internal AttachableCollection()
        {
            ((INotifyCollectionChanged)this).CollectionChanged += OnCollectionChanged;
            _snapshot = new Collection<T>();
        }
        protected abstract void OnAttached();
        protected abstract void OnDetaching();
        internal abstract void ItemAdded(T item);
        internal abstract void ItemRemoved(T item);
        [Conditional("DEBUG")]
        private void VerifySnapshotIntegrity()
        {
            bool flag = Count == _snapshot.Count;
            if (flag)
            {
                for (int i = 0; i < Count; i++)
                {
                    if (base[i] != _snapshot[i])
                    {
                        return;
                    }
                }
            }
        }
        private void VerifyAdd(T item)
        {
            if (_snapshot.Contains(item))
            {
                throw new InvalidOperationException(string.Format(CultureInfo.CurrentCulture, "Cannot add the same instance of {0} to a {1} more than once.", new object[]
				{
					typeof(T).Name,
					GetType().Name
				}));
            }
        }

        private void OnCollectionChanged(object sender, NotifyCollectionChangedEventArgs e)
        {
            switch (e.Action)
            {
                case NotifyCollectionChangedAction.Add:
                {
                    IEnumerator enumerator = e.NewItems.GetEnumerator();
                    try
                    {
                        while (enumerator.MoveNext())
                        {
                            T t = (T) ((object) enumerator.Current);
                            try
                            {
                                VerifyAdd(t);
                                ItemAdded(t);
                            }
                            finally
                            {
                                _snapshot.Insert(IndexOf(t), t);
                            }
                        }
                        return;
                    }
                    finally
                    {
                        IDisposable disposable = enumerator as IDisposable;
                        if (disposable != null)
                        {
                            disposable.Dispose();
                        }
                    }
                }
                case NotifyCollectionChangedAction.Remove:
                    IEnumerator enumerator4 = e.OldItems.GetEnumerator();
                    try
                    {
                        while (enumerator4.MoveNext())
                        {
                            T item2 = (T) ((object) enumerator4.Current);
                            ItemRemoved(item2);
                            _snapshot.Remove(item2);
                        }
                        return;
                    }
                    finally
                    {
                        IDisposable disposable4 = enumerator4 as IDisposable;
                        if (disposable4 != null)
                        {
                            disposable4.Dispose();
                        }
                    }
                case NotifyCollectionChangedAction.Replace:
                    IEnumerator enumerator2 = e.OldItems.GetEnumerator();
                    try
                    {
                        while (enumerator2.MoveNext())
                        {
                            T item = (T) ((object) enumerator2.Current);
                            ItemRemoved(item);
                            _snapshot.Remove(item);
                        }
                    }
                    finally
                    {
                        IDisposable disposable2 = enumerator2 as IDisposable;
                        if (disposable2 != null)
                        {
                            disposable2.Dispose();
                        }
                    }
                    IEnumerator enumerator3 = e.NewItems.GetEnumerator();
                    try
                    {
                        while (enumerator3.MoveNext())
                        {
                            T t2 = (T) ((object) enumerator3.Current);
                            try
                            {
                                VerifyAdd(t2);
                                ItemAdded(t2);
                            }
                            finally
                            {
                                _snapshot.Insert(IndexOf(t2), t2);
                            }
                        }
                        return;
                    }
                    finally
                    {
                        IDisposable disposable3 = enumerator3 as IDisposable;
                        if (disposable3 != null)
                        {
                            disposable3.Dispose();
                        }
                    }
                case NotifyCollectionChangedAction.Move:
                    return;
                case NotifyCollectionChangedAction.Reset:
                    foreach (T current in _snapshot)
                    {
                        ItemRemoved(current);
                    }
                    _snapshot = new Collection<T>();
                    foreach (T current2 in this)
                    {
                        VerifyAdd(current2);
                        ItemAdded(current2);
                    }
                    break;
                default:
                    return;
            }


        }

        public void Attach(DependencyObject dependencyObject)
        {
            if (dependencyObject != AssociatedObject)
            {
                if (AssociatedObject != null)
                {
                    throw new InvalidOperationException();
                }
                if (Interaction.ShouldRunInDesignMode || !(bool)GetValue(DesignerProperties.IsInDesignModeProperty))
                {
                    WritePreamble();
                    _associatedObject = dependencyObject;
                    WritePostscript();
                }
                OnAttached();
            }
        }
        public void Detach()
        {
            OnDetaching();
            WritePreamble();
            _associatedObject = null;
            WritePostscript();
        }
    }
}
