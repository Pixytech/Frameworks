using System.Collections;

namespace Pixytech.Desktop.Presentation.Controls
{
    public interface ISuggestionProvider
    {

        #region Public Methods

        IEnumerable GetSuggestions(string filter);

        #endregion Public Methods

    }
}
