using System;
using System.Windows;
using Microsoft.Practices.Prism.Regions;

namespace Pixytech.Desktop.Presentation.Infrastructure
{
    public static class NavigationExtensions
    {
        private static Uri GetViewUriFromType(Type type)
        {
            return new Uri(type.AssemblyQualifiedName ?? type.FullName, UriKind.RelativeOrAbsolute);
        }

        public static void RequestNavigate<TViewType>(this IRegionManager regionManager, string regionName)
        {
            var uri = GetViewUriFromType(typeof(TViewType));
            regionManager.RequestNavigate(regionName, uri);
        }

        public static void RequestNavigate(this IRegionManager regionManager, string regionName, ViewModelBase instance, bool createIfDoesNotExists = true)
        {
            if (regionManager.Regions.ContainsRegionWithName(regionName))
            {
                if (regionManager.Regions[regionName].Views.Contains(instance))
                {
                    regionManager.Regions[regionName].Activate(instance);
                }
                else
                {
                    if (createIfDoesNotExists)
                    {
                        regionManager.AddToRegion(regionName, instance);
                        regionManager.Regions[regionName].Activate(instance);
                    }
                }
            }
        }

        public static void RequestNavigate(this IRegionManager regionManager, string regionName, DependencyObject instance, bool createIfDoesNotExists = true)
        {
            if (regionManager.Regions.ContainsRegionWithName(regionName))
            {
                if (regionManager.Regions[regionName].Views.Contains(instance))
                {
                    regionManager.Regions[regionName].Activate(instance);
                }
                else
                {
                    if (createIfDoesNotExists)
                    {
                        regionManager.AddToRegion(regionName, instance);
                        regionManager.Regions[regionName].Activate(instance);
                    }
                }
            }
        }

        public static void RequestNavigate<TViewType>(this IRegionManager regionManager, string regionName, NavigationParameters navigationParameters)
        {
            var uri = GetViewUriFromType(typeof(TViewType));
            regionManager.RequestNavigate(regionName, uri, navigationParameters);
        }

        public static void RequestNavigate<TViewType>(this IRegionManager regionManager, string regionName, Action<NavigationResult> navigationCallback)
        {
            var uri = GetViewUriFromType(typeof(TViewType));
            regionManager.RequestNavigate(regionName, uri, navigationCallback);
        }

        public static void RequestNavigate<TViewType>(this IRegionManager regionManager,
            string regionName, Action<NavigationResult> navigationCallback,
            NavigationParameters navigationParameters)
        {
            var uri = GetViewUriFromType(typeof(TViewType));
            regionManager.RequestNavigate(regionName, uri, navigationCallback, navigationParameters);
        }
    
    }
}
