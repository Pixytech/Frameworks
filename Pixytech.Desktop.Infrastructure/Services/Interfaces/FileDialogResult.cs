﻿namespace Pixytech.Desktop.Presentation.Infrastructure.Services.Interfaces
{
    public class FileDialogResult
    {
        private readonly string _fileName;
        private readonly FileType _selectedFileType;


        /// <summary>
        /// Initializes a new instance of the <see cref="FileDialogResult"/> class with null values.
        /// Use this constructor when the user canceled the file dialog box.
        /// </summary>
        public FileDialogResult()
            : this(null, null)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="FileDialogResult"/> class.
        /// </summary>
        /// <param name="fileName">The filename entered by the user.</param>
        /// <param name="selectedFileType">The file type selected by the user.</param>
        public FileDialogResult(string fileName, FileType selectedFileType)
        {
            _fileName = fileName;
            _selectedFileType = selectedFileType;
        }


        /// <summary>
        /// Gets a value indicating whether this instance contains valid data. This property returns <c>false</c>
        /// when the user canceled the file dialog box.
        /// </summary>
        public bool IsValid { get { return FileName != null && SelectedFileType != null; } }

        /// <summary>
        /// Gets the filename entered by the user or <c>null</c> when the user canceled the dialog box.
        /// </summary>
        public string FileName { get { return _fileName; } }

        /// <summary>
        /// Gets the file type selected by the user or <c>null</c> when the user canceled the dialog box.
        /// </summary>
        public FileType SelectedFileType { get { return _selectedFileType; } }
    }
}
