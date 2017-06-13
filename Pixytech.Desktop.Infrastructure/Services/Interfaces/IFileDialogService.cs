using System.Collections.Generic;
using System.Threading.Tasks;

namespace Pixytech.Desktop.Presentation.Infrastructure.Services.Interfaces
{
    public interface IFileDialogService
    {
        FileDialogResult ShowOpenFileDialog(IEnumerable<FileType> fileTypes, FileType defaultFileType, string defaultFileName);

        FileDialogResult ShowSaveFileDialog(IEnumerable<FileType> fileTypes, FileType defaultFileType, string defaultFileName);
    }
}
