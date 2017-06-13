using System.Collections.Generic;
using System.Linq;

namespace Pixytech.Core.IoC
{
    public static class IocExtensions
    {
        public static bool HasComponent<T>(this IContainer container)
        {
            var componentType = typeof(T);
            return container.HasComponent(componentType);
        }

        public static T Build<T>(this IContainer container)
        {
            var typeToBuild = typeof(T);
            return (T)container.Build(typeToBuild);
        }

        public static IEnumerable<TService>  BuildAll<TService>(this IContainer container)
        {
            var typeToBuild = typeof(TService);
            var types = container.BuildAll(typeToBuild);
            return types.Select(t => (TService) t).ToList();
        }
    }
}
