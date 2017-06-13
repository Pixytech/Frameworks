using System;
using System.Reflection;
using System.Windows;
using Pixytech.Desktop.Presentation.Infrastructure.Services.Interfaces;

namespace Pixytech.Desktop.Presentation.Services
{
    public class ResourceAggregatorService : IResourceAggregator
    {
        public ResourceAggregatorService()
        {
            AddResource("Resources/ViewMappings.xaml");    
        }

       public void AddResource(string resourcePath)
        {
            var source = new Uri(resourcePath, UriKind.RelativeOrAbsolute);

            var currentResource = string.Format("{0}", resourcePath);
            if (!currentResource.ToLower().Contains(";component/"))
            {
                var callingAssembly = Assembly.GetCallingAssembly();
                var assemblyName = callingAssembly.GetName().Name;

                source = new Uri(string.Format("/{0};component/{1}", assemblyName, source),
                    UriKind.RelativeOrAbsolute);
            }

            var resourceDictionary = new ResourceDictionary { Source = source };

            var app = Application.Current;
            if (app != null)
            {
                app.Resources.MergedDictionaries.Add(resourceDictionary);
            }
        }

        public bool TryUpdateResource<T>(string resourceKey, T resourceValue)
        {
            var app = Application.Current;
            if (app != null)
            {
                T resource;

                if (TryGetResource(resourceKey, out resource))
                {
                    resource = resourceValue;
                    return resource != null;
                }
            }

            return false;
        }
        
        public bool TryGetResource<T>(string resourceKey, out T resourceValue)
        {
            resourceValue = default(T);
            var app = Application.Current;
            if (app != null)
            {
                var resource = (T)app.TryFindResource(resourceKey);

                if (resource != null)
                {
                    resourceValue = resource;
                    return resource != null;
                }
            }

            return false;
        }


        public bool TryRemoveResource(string resourcePath)
        {
            ResourceDictionary resourceDictionary;
            var app = Application.Current;
            if (app != null && TryGetResourceDictionary(resourcePath, out resourceDictionary))
            {
                app.Resources.MergedDictionaries.Remove(resourceDictionary);
                    return true;
            }
            return false;
        }

        private ResourceDictionary GetMatchedResource(ResourceDictionary resourceDictionary)
        {
              var app = Application.Current;
            if (app != null)
            {
                foreach (var mergedDictionary in app.Resources.MergedDictionaries)
                {
                    if (mergedDictionary.Source == resourceDictionary.Source)
                    {
                        return mergedDictionary;
                    }
                }
            }
            return null;
        }

        public bool TryGetResourceDictionary(string resourcePath, out ResourceDictionary resourceDictionary)
        {
            var source = new Uri(resourcePath, UriKind.RelativeOrAbsolute);

            var currentResource = string.Format("{0}", resourcePath);
            if (!currentResource.ToLower().Contains(";component/"))
            {
                var callingAssembly = Assembly.GetCallingAssembly();
                var assemblyName = callingAssembly.GetName().Name;

                source = new Uri(string.Format("/{0};component/{1}", assemblyName, source),
                    UriKind.RelativeOrAbsolute);
            }

            var sourceresourceDictionary = new ResourceDictionary();
            sourceresourceDictionary.Source = source;
            var app = Application.Current;
            if (app != null)
            {
                resourceDictionary = GetMatchedResource(sourceresourceDictionary);
                return resourceDictionary!= null;
            }
            resourceDictionary = null;
            return false;
        }
    }
}
