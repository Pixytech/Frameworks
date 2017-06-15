using Pixytech.Desktop.Presentation.Infrastructure.Services.Interfaces;
using System.Collections;
using System.Runtime.CompilerServices;

namespace Pixytech.Desktop.Presentation.Infrastructure.Helpers
{
    class CollectionLockProvider : ICollectionLockProvider
    {
        private readonly ConditionalWeakTable<IEnumerable, object> weakTable = new ConditionalWeakTable<IEnumerable, object>();

        public object GetLock(IEnumerable collection)
        {
            return weakTable.GetValue(collection,key => {
                if(key is INeedSyncronization)
                {
                    return ((INeedSyncronization)key).SyncLock;
                }else
                {
                    return new object();
                }
            });
        }
    }
}
