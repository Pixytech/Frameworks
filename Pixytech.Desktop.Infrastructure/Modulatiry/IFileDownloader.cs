using System;
using System.Net;

namespace Pixytech.Desktop.Presentation.Infrastructure.Modulatiry
{
    /// <summary>
    /// Defines a contract for the object used to download files asynchronously.
    /// </summary>
    public interface IFileDownloader
    {
        /// <summary>
        /// Raised whenever the download progress changes.
        /// </summary>
        event EventHandler<DownloadProgressChangedEventArgs> DownloadProgressChanged;

        /// <summary>
        /// Raised download is complete.
        /// </summary>
        event EventHandler<DownloadCompletedEventArgs> DownloadCompleted;

        /// <summary>
        /// Starts downloading asynchronously a file from <paramref name="uri"/>.
        /// </summary>
        /// <param name="uri">The location of the file to be downloaded.</param>
        /// <param name="userToken">Provides a user-specified identifier for the asynchronous task.</param>
        void DownloadAsync(Uri uri, object userToken);
    }
}
