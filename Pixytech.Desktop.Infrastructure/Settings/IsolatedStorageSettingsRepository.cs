namespace Pixytech.Desktop.Presentation.Infrastructure.Settings
{
    public class IsolatedStorageSettingsRepository : JsonSettingsRepositoryBase
    {
        protected override void WriteTextFile(string filename, string fileContents)
        {
            using (System.IO.IsolatedStorage.IsolatedStorageFile isoStore = System.IO.IsolatedStorage.IsolatedStorageFile.GetStore(System.IO.IsolatedStorage.IsolatedStorageScope.User | System.IO.IsolatedStorage.IsolatedStorageScope.Domain | System.IO.IsolatedStorage.IsolatedStorageScope.Assembly, null, null))
            {
                using (var stream = new System.IO.IsolatedStorage.IsolatedStorageFileStream(filename, System.IO.FileMode.Create, isoStore))
                {
                    using (var streamWriter = new System.IO.StreamWriter(stream))
                    {
                        streamWriter.Write(fileContents);
                        streamWriter.Flush();
                    }
                }
            }
        }
        protected override string ReadTextFile(string filename)
        {
            using (System.IO.IsolatedStorage.IsolatedStorageFile isoStore = System.IO.IsolatedStorage.IsolatedStorageFile.GetStore(System.IO.IsolatedStorage.IsolatedStorageScope.User | System.IO.IsolatedStorage.IsolatedStorageScope.Domain | System.IO.IsolatedStorage.IsolatedStorageScope.Assembly, null, null))
            {
                if (isoStore.FileExists(filename))
                {
                    using (var stream = new System.IO.IsolatedStorage.IsolatedStorageFileStream(filename, System.IO.FileMode.Open, isoStore))
                    {
                        return new System.IO.StreamReader(stream).ReadToEnd();
                    }
                }
            }
            return null;
        }
        public override bool HasSettings(string key)
        {
            string filename = key + ".settings";
            bool result;
            using (System.IO.IsolatedStorage.IsolatedStorageFile isoStore = System.IO.IsolatedStorage.IsolatedStorageFile.GetStore(System.IO.IsolatedStorage.IsolatedStorageScope.User | System.IO.IsolatedStorage.IsolatedStorageScope.Domain | System.IO.IsolatedStorage.IsolatedStorageScope.Assembly, null, null))
            {
                result = isoStore.FileExists(filename);
            }
            return result;
        }
    }
}
