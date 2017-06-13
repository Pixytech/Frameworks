using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Graphnet.Dashboard.WebContracts.Dataflow;
using Graphnet.Dashboard.WebContracts.Dataflow.Metadata;
using Graphnet.Dashboard.Wpf.Presentation.Infrastructure.Dataflow;

namespace Graphnet.Dashboard.CoreUI.ViewModels.Dataflow.Editors.Ruleset
{
    internal interface IRuleOptionsVm
    {
        IVariableProvider VariableProvider { get; set; }

        void PrepareForSave();

        IMiddlewareOptionBase MiddlewareOption { get; set; }

        bool HasData { get; }

        Task InitializeVm();

        bool Validate();

        Action RequestValidationAction { get; set; }

        IEnumerable<ConditionsMetadata> AvailableConditionsMetadata { get; set; }
        IEnumerable<ActionsMetadata> AvailableActionsMetadata { get; set; }

        void RequestValidation();
    }
}
