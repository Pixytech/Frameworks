namespace Pixytech.Core.IoC
{
    public interface IObjectConfig
    {
        /// <summary>
        /// Configures the value of the named property of the component.
        /// </summary>
        IObjectConfig ConfigureProperty(string name, object value);
    }
}
