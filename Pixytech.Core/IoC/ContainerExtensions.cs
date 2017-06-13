using Pixytech.Core.IoC.Internal;

namespace Pixytech.Core.IoC
{
    public static class ContainerExtensions
    {
          public static void AddModule<T>(this IContainer container)where T : IModule
          {
              container.Configure(typeof(T), ObjectLifecycle.SingleInstance);
              var module = container.Build<T>();
              var configurer = new ObjectBuilder { Container = container };
              configurer.AddModule(module);
        }

        public static void AddModule<T>(this IBuilder builder) where T : IModule
        {
            var objectBuilder = builder.Build<ObjectBuilder>();
            objectBuilder.ConfigureType<T>(ObjectLifecycle.SingleInstance);
            var module = builder.Build<T>();
            objectBuilder.AddModule(module);
        }

        public static void AddModule(this IConfigureTypes configurer, IModule module) 
        {
            if (module!= null){
                module.Configure(configurer);
            }
        }

        public static void AddModule<T>(this ObjectBuilder builder) where T : IModule
        {
            var module = builder.Build<T>();
            module.Configure(builder);
        }
    }
}
