using System;
using System.Net;

namespace Pixytech.Desktop.Presentation.Infrastructure.Modulatiry
{
    /// <summary>
    /// Defines the component used to download files.
    /// </summary>
    /// <remarks>This is mainly a wrapper for the <see cref="WebClient"/> class that implements <see cref="IFileDownloader"/>.</remarks>
    public class FileDownloader : IFileDownloader
    {
        protected WebClient WebClient { get; private set; }

        private event EventHandler<DownloadProgressChangedEventArgs> _downloadProgressChanged;
        private event EventHandler<DownloadCompletedEventArgs> _downloadCompleted;

        public FileDownloader()
        {
            WebClient = new WebClient {Credentials = CredentialCache.DefaultCredentials};
        }


        /// <summary>
        /// Raised whenever the download progress changes.
        /// </summary>
        public event EventHandler<DownloadProgressChangedEventArgs> DownloadProgressChanged
        {
            add
            {
                if (_downloadProgressChanged == null)
                {
                    WebClient.DownloadProgressChanged += WebClient_DownloadProgressChanged;
                }

                _downloadProgressChanged += value;
            }

            remove
            {
                _downloadProgressChanged -= value;
                if (_downloadProgressChanged == null)
                {
                    WebClient.DownloadProgressChanged -= WebClient_DownloadProgressChanged;
                }
            }
        }


        /// <summary>
        /// Raised download is complete.
        /// </summary>
        public event EventHandler<DownloadCompletedEventArgs> DownloadCompleted
        {
            add
            {
                if (_downloadCompleted == null)
                {
                    WebClient.OpenReadCompleted += WebClient_OpenReadCompleted;
                }

                _downloadCompleted += value;
            }

            remove
            {
                _downloadCompleted -= value;
                if (_downloadCompleted == null)
                {
                    WebClient.OpenReadCompleted -= WebClient_OpenReadCompleted;
                }
            }
        }

        /// <summary>
        /// Starts downloading asynchronously a file from <paramref name="uri"/>.
        /// </summary>
        /// <param name="uri">The location of the file to be downloaded.</param>
        /// <param name="userToken">Provides a user-specified identifier for the asynchronous task.</param>
        public virtual void DownloadAsync(Uri uri, object userToken)
        {
            WebClient.OpenReadAsync(uri, userToken);
        }

        private static DownloadCompletedEventArgs ConvertArgs(OpenReadCompletedEventArgs args)
        {
            return new DownloadCompletedEventArgs(args.Error == null ? args.Result : null, args.Error, args.Cancelled, args.UserState);
        }

        void WebClient_DownloadProgressChanged(object sender, DownloadProgressChangedEventArgs e)
        {
            _downloadProgressChanged(this, e);
        }

        private void WebClient_OpenReadCompleted(object sender, OpenReadCompletedEventArgs e)
        {
            _downloadCompleted(this, ConvertArgs(e));
        }
    }
}
