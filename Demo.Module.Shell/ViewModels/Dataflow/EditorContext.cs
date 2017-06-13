using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using Graphnet.Dashboard.WebContracts.Dataflow;
using Graphnet.Dashboard.Wpf.Presentation.Infrastructure.Dataflow;
using Graphnet.Wpf.Presentation.Infrastructure;

namespace Graphnet.Dashboard.CoreUI.ViewModels.Dataflow
{
    class EditorContext: ViewModelBase, IEditorContext
    {
        private readonly Action _onValidate;

        public EditorContext(Action onValidate)
        {
            _onValidate = onValidate;
        }

        public IMiddlewareOptionBase MiddlewareOption { get; set; }

        public Type MiddlewareOptionType { get; set; }

        //public Type MessageType { get; set; }

        public ObservableCollection<VariableModel> Variables { get; set; }

        public void Validate()
        {
            _onValidate.Invoke();
        }
    }
}
