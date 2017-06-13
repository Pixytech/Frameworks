using System;
using System.ComponentModel;
using System.IO;

namespace Pixytech.Desktop.Presentation.Infrastructure.Modulatiry
{
    /// <summary>
    /// Provides data for the <see cref="FileDownloader.DownloadCompleted"/> event.
    /// </summary>
    public class DownloadCompletedEventArgs : AsyncCompletedEventArgs
    {
        private readonly Stream _result;

        /// <summary>
        /// Initializes a new instance of the <see cref="DownloadCompletedEventArgs"/> class.
        /// </summary>
        /// <param name="result">The downloaded <see cref="Stream"/>.</param>
        /// <param name="error">Any error that occurred during the asynchronous operation.</param>
        /// <param name="canceled">A value that indicates whether the asynchronous operation was canceled.</param>
        /// <param name="userState">The optional user-supplied state object that is used to identify the task that raised the MethodNameCompleted event.</param>
        public DownloadCompletedEventArgs(Stream result, Exception error, bool canceled, object userState)
            : base(error, canceled, userState)
        {
            _result = result;
        }

        /// <summary>
        /// Gets the downloaded <see cref="Stream"/>.
        /// </summary>
        public Stream Result
        {
            get { return _result; }
        }
    }
}
