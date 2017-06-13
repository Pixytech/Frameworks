using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Reflection;
using System.Windows;
using System.Windows.Resources;
using System.Xml.Linq;
using Pixytech.Core.IoC;
using Microsoft.Practices.Prism;
using Microsoft.Practices.Prism.Modularity;
using Microsoft.Practices.Prism.PubSubEvents;
using Microsoft.Practices.ServiceLocation;
using DownloadProgressChangedEventArgs = System.Net.DownloadProgressChangedEventArgs;

namespace Pixytech.Desktop.Presentation.Infrastructure.Modulatiry
{
    /// <summary>
    /// Component responsible for downloading remote modules 
    /// and load their <see cref="Type"/> into the current application domain.
    /// </summary>
    [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Naming", "CA1704:IdentifiersShouldBeSpelledCorrectly", MessageId = "Xap")]
    public class XapModuleTypeLoader : IModuleTypeLoader
    {
        private readonly Dictionary<Uri, List<ModuleInfo>> _downloadingModules = new Dictionary<Uri, List<ModuleInfo>>();
        private readonly HashSet<Uri> _downloadedUris = new HashSet<Uri>();

        /// <summary>
        /// Raised repeatedly to provide progress as modules are loaded in the background.
        /// </summary>
        public event EventHandler<ModuleDownloadProgressChangedEventArgs> ModuleDownloadProgressChanged;

        /// <summary>
        /// Raised when a module is loaded or fails to load.
        /// </summary>
        public event EventHandler<LoadModuleCompletedEventArgs> LoadModuleCompleted;

        private readonly IEventAggregator _eventAggregator;
        private IServiceLocator _serviceLocator;

        public XapModuleTypeLoader(IEventAggregator eventAggregator, IServiceLocator serviceLocator)
        {
            _eventAggregator = eventAggregator;
            _serviceLocator = serviceLocator;
        }
        private void RaiseModuleDownloadProgressChanged(ModuleDownloadProgressChangedEventArgs e)
        {
            if (ModuleDownloadProgressChanged != null)
            {
                ModuleDownloadProgressChanged(this, e);
            }

            _eventAggregator.GetEvent<ModuleDownloadProgressEvent>().Publish(e);
        }

        private void RaiseLoadModuleCompleted(ModuleInfo moduleInfo, Exception error)
        {
            RaiseLoadModuleCompleted(new LoadModuleCompletedEventArgs(moduleInfo, error));
        }

        private void RaiseLoadModuleCompleted(LoadModuleCompletedEventArgs e)
        {
            if (LoadModuleCompleted != null)
            {
                LoadModuleCompleted(this, e);
            }

           _eventAggregator.GetEvent<LoadModuleCompletedEvent>().Publish(e);
        }

        /// <summary>
        /// Evaluates the <see cref="ModuleInfo.Ref"/> property to see if the current typeloader will be able to retrieve the <paramref name="moduleInfo"/>.
        /// </summary>
        /// <param name="moduleInfo">Module that should have it's type loaded.</param>
        /// <returns><see langword="true"/> if the current typeloader is able to retrieve the module, otherwise <see langword="false"/>.</returns>
        public bool CanLoadModuleType(ModuleInfo moduleInfo)
        {
            if (moduleInfo == null) throw new ArgumentNullException("moduleInfo");
            if (!string.IsNullOrEmpty(moduleInfo.Ref))
            {
                Uri uri;
                return Uri.TryCreate(moduleInfo.Ref, UriKind.RelativeOrAbsolute, out uri);
            }

            return false;
        }

        /// <summary>
        /// Retrieves the <paramref name="moduleInfo"/>.
        /// </summary>
        /// <param name="moduleInfo">Module that should have it's type loaded.</param>
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Design", "CA1031:DoNotCatchGeneralExceptionTypes", Justification = "Error is sent to completion event")]
        public void LoadModuleType(ModuleInfo moduleInfo)
        {
            if (moduleInfo == null)
            {
                throw new ArgumentNullException("moduleInfo");
            }

            try
            {
                var uri = new Uri(moduleInfo.Ref, UriKind.RelativeOrAbsolute);

                // If this module has already been downloaded, I fire the completed event.
                if (IsSuccessfullyDownloaded(uri))
                {
                    RaiseLoadModuleCompleted(moduleInfo, null);
                }
                else
                {
                    bool needToStartDownload = !IsDownloading(uri);

                    // I record downloading for the moduleInfo even if I don't need to start a new download
                    RecordDownloading(uri, moduleInfo);

                    if (needToStartDownload)
                    {
                        IFileDownloader downloader = CreateDownloader();
                        downloader.DownloadProgressChanged += IFileDownloader_DownloadProgressChanged;
                        downloader.DownloadCompleted += IFileDownloader_DownloadCompleted;
                        downloader.DownloadAsync(uri, uri);
                    }
                }
            }
            catch (Exception ex)
            {
                RaiseLoadModuleCompleted(moduleInfo, ex);
            }
        }

        /// <summary>
        /// Creates the <see cref="IFileDownloader"/> used to retrieve the remote modules.
        /// </summary>
        /// <returns>The <see cref="IFileDownloader"/> used to retrieve the remote modules.</returns>
        protected virtual IFileDownloader CreateDownloader()
        {
            var fileDownloader = _serviceLocator.TryResolve<IFileDownloader>() ?? new FileDownloader();

            return fileDownloader;
        }

        void IFileDownloader_DownloadProgressChanged(object sender, DownloadProgressChangedEventArgs e)
        {
            // I ensure the download completed is on the UI thread so that types can be loaded into the application domain.
            if (!Application.Current.Dispatcher.CheckAccess())
            {
                Application.Current.Dispatcher.BeginInvoke(new Action<DownloadProgressChangedEventArgs>(HandleModuleDownloadProgressChanged), e);
            }
            else
            {
                HandleModuleDownloadProgressChanged(e);
            }
        }

        private void HandleModuleDownloadProgressChanged(DownloadProgressChangedEventArgs e)
        {
            var uri = (Uri)e.UserState;
            var moduleInfos = GetDownloadingModules(uri);

            foreach (ModuleInfo moduleInfo in moduleInfos)
            {
                RaiseModuleDownloadProgressChanged(new ModuleDownloadProgressChangedEventArgs(moduleInfo, e.BytesReceived, e.TotalBytesToReceive));
            }
        }

        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Design", "CA1031:DoNotCatchGeneralExceptionTypes")]
        private void IFileDownloader_DownloadCompleted(object sender, DownloadCompletedEventArgs e)
        {
            // A new IFileDownloader instance is created for each download.
            // I unregister the event to allow for garbage collection.
            var fileDownloader = (IFileDownloader)sender;
            fileDownloader.DownloadProgressChanged -= IFileDownloader_DownloadProgressChanged;
            fileDownloader.DownloadCompleted -= IFileDownloader_DownloadCompleted;
            HandleModuleDownloaded(e);
        }

        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Design", "CA1031:DoNotCatchGeneralExceptionTypes",
            Justification = "Exception sent to completion event")]
        private void HandleModuleDownloaded(DownloadCompletedEventArgs e)
        {
            var uri = (Uri) e.UserState;
            var moduleInfos = GetDownloadingModules(uri);

            var error = e.Error;

            var modulesInfoArray = moduleInfos as ModuleInfo[] ?? moduleInfos.ToArray();
            if (error == null)
            {
                try
                {
                    RecordDownloadComplete(uri);

                    Debug.Assert(!e.Cancelled, "Download should not be cancelled");
                    Stream stream = e.Result.CopyStream();
                    var defination = GetModuleDefination(stream);
                    ExtractModule(defination.ModuleName, stream);

                    stream.Close();

                    if (!Application.Current.Dispatcher.CheckAccess())
                    {
                        Application.Current.Dispatcher.Invoke(
                            new Action<ModuleDefination, IEnumerable<ModuleInfo>>(LoadModule), moduleInfos, error);
                    }
                    else
                    {
                        LoadModule(defination, modulesInfoArray);
                    }
                    

                    RecordDownloadSuccess(uri);
                }
                catch (Exception ex)
                {
                    error = ex;
                }
                finally
                {
                    e.Result.Close();
                }
            }

            if (!Application.Current.Dispatcher.CheckAccess())
            {
                Application.Current.Dispatcher.BeginInvoke(
                    new Action<IEnumerable<ModuleInfo>, Exception>(RaiseLoadModuleCompletedOnUi), moduleInfos, error);
            }
            else
            {
                RaiseLoadModuleCompletedOnUi(modulesInfoArray, error);
            }

        }

        private void LoadModule(ModuleDefination defination, IEnumerable<ModuleInfo> moduleInfos)
        {
            string moduleEntryPointAssembly = defination.EntryPointAssembly;

            string moduleName = defination.ModuleName;

            var moduleDir = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Components", moduleName);

            if (!string.IsNullOrEmpty(defination.EntryPointAssembly) && !string.IsNullOrEmpty(defination.EntryPointType) && Directory.Exists(moduleDir))
            {
                var moduleAssemblyPath = Path.Combine(moduleDir, moduleEntryPointAssembly + ".dll");

                if (File.Exists(moduleAssemblyPath))
                {
                    var moduleAssembly = AppDomain.CurrentDomain.Load(AssemblyName.GetAssemblyName(moduleAssemblyPath));

                    var moduleEntryType = moduleAssembly.GetType(defination.EntryPointType, true, true);

                    ObjectFactory.Configure(c => c.ConfigureType(moduleEntryType, ObjectLifecycle.SingleInstance));

                    foreach (var moduleInfo in moduleInfos.Where(moduleInfo => string.IsNullOrEmpty(moduleInfo.ModuleType)))
                    {
                        moduleInfo.ModuleType = moduleEntryType.AssemblyQualifiedName;
                    }
                }
            }
        }

        private void RaiseLoadModuleCompletedOnUi(IEnumerable<ModuleInfo> moduleInfos, Exception error)
        {
            foreach (var moduleInfo in moduleInfos)
            {
                RaiseLoadModuleCompleted(moduleInfo, error);
            }
        }

        private bool IsDownloading(Uri uri)
        {
            lock (_downloadingModules)
            {
                return _downloadingModules.ContainsKey(uri);
            }
        }

        private void RecordDownloading(Uri uri, ModuleInfo moduleInfo)
        {
            lock (_downloadingModules)
            {
                List<ModuleInfo> moduleInfos;
                if (!_downloadingModules.TryGetValue(uri, out moduleInfos))
                {
                    moduleInfos = new List<ModuleInfo>();
                    _downloadingModules.Add(uri, moduleInfos);
                }

                if (!moduleInfos.Contains(moduleInfo))
                {
                    moduleInfos.Add(moduleInfo);
                }
            }
        }

        private IEnumerable<ModuleInfo> GetDownloadingModules(Uri uri)
        {
            lock (_downloadingModules)
            {
                return new List<ModuleInfo>(_downloadingModules[uri]);
            }
        }

        private void RecordDownloadComplete(Uri uri)
        {
            lock (_downloadingModules)
            {
                if (!_downloadingModules.ContainsKey(uri))
                {
                    _downloadingModules.Remove(uri);
                }
            }
        }

        private bool IsSuccessfullyDownloaded(Uri uri)
        {
            lock (_downloadedUris)
            {
                return _downloadedUris.Contains(uri);
            }
        }

        private void RecordDownloadSuccess(Uri uri)
        {
            lock (_downloadedUris)
            {
                _downloadedUris.Add(uri);
            }
        }

        private static ModuleDefination GetModuleDefination(Stream stream)
        {
            var parts = new List<AssemblyPart>();
            var result = new ModuleDefination(parts);
            using( var streamReader = new StreamReader(GetResourceStream(new StreamResourceInfo(stream, null), new Uri("AppManifest.xaml", UriKind.Relative))))
            {
                var xDocument = XDocument.Parse(streamReader.ReadToEnd());

                result.EntryPointAssembly = xDocument.Root.Attribute("EntryPointAssembly").Value;
                result.EntryPointType = xDocument.Root.Attribute("EntryPointType").Value;
                result.ModuleName = xDocument.Root.Attribute("ModuleName").Value;
                result.RuntimeVersion = xDocument.Root.Attribute("RuntimeVersion").Value;
                var xParts = (from part in xDocument.Descendants().Elements("Deployment.Parts") select part).FirstOrDefault();

                foreach (var xPart in xParts.Descendants("AssemblyPart"))
                {
                    parts.Add(new AssemblyPart() { Source = xPart.Attribute("Source").Value });
                }
            }
            return result;
        }

        private static Stream GetResourceStream(StreamResourceInfo zipStreamResourceInfo, Uri uri)
        {
            zipStreamResourceInfo.Stream.Seek(0, SeekOrigin.Begin);
            var archive = new ZipArchive(zipStreamResourceInfo.Stream);
            var entry = archive.GetEntry(uri.ToString());
            return entry.Open().CopyStream();
        }

        private static void SavePartFromStream(string moduleName, Stream sourceStream, AssemblyPart assemblyPart)
        {
            Stream assemblyStream = GetResourceStream(
                new StreamResourceInfo(sourceStream, null),
                new Uri(assemblyPart.Source, UriKind.Relative));

            assemblyPart.Save(moduleName, assemblyPart.Source, assemblyStream);
        }

        private void ExtractModule(string moduleName, Stream sourceStream)
        {
            var moduleDir = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Components", moduleName);

            if (!Directory.Exists(moduleDir))
            {
                Directory.CreateDirectory(moduleDir);
            }

            ExtractStreamToDirectory(new StreamResourceInfo(sourceStream, null), moduleDir);
        }

        private void ExtractStreamToDirectory(StreamResourceInfo zipStreamResourceInfo, string moduleDir)
        {
            zipStreamResourceInfo.Stream.Seek(0, SeekOrigin.Begin);
            using (var archive = new ZipArchive(zipStreamResourceInfo.Stream))
            {
                var result = from currEntry in archive.Entries
                             where !String.IsNullOrEmpty(currEntry.Name)
                             select currEntry;


                foreach (var entry in result)
                {
                    var target = Path.Combine(moduleDir, entry.FullName);
                  
                        try
                        {
                            if (File.Exists(target))
                            {
                                File.Delete(target);
                            }

                            var targetDir = Path.GetDirectoryName(target);

                            if (!Directory.Exists(targetDir))
                            {
                                Directory.CreateDirectory(targetDir);
                            }

                            entry.ExtractToFile(target);
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.ToString());
                        }
                }
            } 
        }
    }
}
