using System;
using Pixytech.Core.IoC.Internal;

namespace Pixytech.Core.IoC
{
    public class ObjectFactory 
    {
        
        static ObjectFactory()
        {
            With(new AutofacObjectBuilder());
        }

        private ObjectFactory()
        {
            
        }
        
        public static void With(IContainer container)
        {
            var b = new ObjectBuilder
            {
                Container = container,
                Synchronized = SyncConfig.Synchronize
            };
            
            Builder = b;
            Configurer = b;
            Container = container;
            
            Configurer.ConfigureType<ObjectBuilder>(ObjectLifecycle.SingleInstance).ConfigureProperty(c => c.Container, container);
            SyncConfig.MarkConfigured();
        }

        public static IContainer Container { get; private set; }

        public static IBuilder Builder { get; private set; }

        private static IConfigureTypes Configurer { get; set; }

        public static void Configure(Action<IConfigureTypes> configurer)
        {
            configurer.Invoke(Configurer);
        }

        public static void AddModule<T>()where T : IModule
        {
            Container.AddModule<T>();
        }

        public static void AddModule<T>(T module) where T : IModule
        {
            Configurer.AddModule(module);
        }

        //public static void AddModule<T>(IConfigureTypes configurer) where T : IModule
        //{
        //    configurer.ConfigureType<T>(ObjectLifecycle.SingleInstance);
        //    var module = Builder.Build<T>();
        //    AddModule(module, configurer);
        //}

        //public static void AddModule<T>(T module, IConfigureTypes configurer) where T : IModule
        //{
        //    module.Configure(configurer);
        //}
    }
}
