using System;
using System.Collections.Generic;
using Pixytech.Core.IoC;
using Microsoft.Practices.ServiceLocation;

namespace Pixytech.Desktop.Presentation.Infrastructure
{
    public class ServiceLocator : IServiceLocator
    {
        private readonly IContainer _context;

        public ServiceLocator(IContainer context)
        {
            _context = context;
        }

        public object GetService(Type serviceType)
        {
            try
            {
                return _context.Build(serviceType);
            }
            catch (Exception exception)
            {
                throw new ActivationException(exception.Message, exception);
            }
        }

        public object GetInstance(Type serviceType)
        {
            try
            {
                return _context.Build(serviceType);
            }
            catch (Exception exception)
            {
                throw new ActivationException(exception.Message, exception);
            }
        }

        public object GetInstance(Type serviceType, string key)
        {
            try
            {
                var decodedKey = Uri.UnescapeDataString(key);

                var t = Type.GetType(decodedKey);

                var result = _context.Build(t);

                return result;
            }
            catch (Exception exception)
            {
                throw new ActivationException(exception.Message, exception);
            }
        }

        public IEnumerable<object> GetAllInstances(Type serviceType)
        {
            try
            {
                Type generic = typeof (IEnumerable<>);
                return _context.BuildAll(generic.MakeGenericType(new[]
                {
                    serviceType
                }));
            }
            catch (Exception exception)
            {
                throw new ActivationException(exception.Message, exception);
            }
        }

        public TService GetInstance<TService>()
        {
            try
            {
                return _context.Build<TService>();
            }
            catch (Exception exception)
            {
                throw new ActivationException(exception.Message, exception);
            }
        }

        public TService GetInstance<TService>(string key)
        {
            var result = GetInstance(typeof (TService), key);

            return (TService) result;
        }

        public IEnumerable<TService> GetAllInstances<TService>()
        {
            try
            {
                return _context.BuildAll<TService>();
            }
            catch (Exception exception)
            {
                throw new ActivationException(exception.Message, exception);
            }
        }
    }
}
