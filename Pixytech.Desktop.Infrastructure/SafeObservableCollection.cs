using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Pixytech.Desktop.Presentation.Infrastructure
{
    public class SafeObservableCollection<T> : ObservableCollection<T>, INeedSyncronization
    {
        public SafeObservableCollection()
        {
            this.SyncLock = new object();
        }

        public object SyncLock { get; private set; }
    }
}
