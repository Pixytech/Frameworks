namespace Pixytech.Core
{
    public interface IApplicationSettings
    {
         string Root { get; set; }

        T Read<T>(string name, T defaultValue = default(T));
    }
}
