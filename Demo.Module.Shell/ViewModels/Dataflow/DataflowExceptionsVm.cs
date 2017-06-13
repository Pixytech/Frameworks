using System;
using System.Collections.ObjectModel;
using Graphnet.Core.IoC;
using Graphnet.Dashboard.CoreUI.Models;
using Graphnet.Dashboard.WebContracts;
using Graphnet.Dashboard.WebContracts.Dataflow;
using Graphnet.Dashboard.Wpf.Presentation.Infrastructure.Services.LiveFeed;
using Graphnet.Wpf.Presentation.Infrastructure;
using Graphnet.Wpf.Presentation.Infrastructure.Commands;
using Graphnet.Wpf.Presentation.Infrastructure.Services.Interfaces;
using Graphnet.Wpf.Presentation.Services;

namespace Graphnet.Dashboard.CoreUI.ViewModels.Dataflow
{
    internal class DataflowExceptionsVm : ViewModelBase
    {
        private readonly IMessageFeedService _messageFeedService;
        private Microsoft.Practices.Prism.PubSubEvents.SubscriptionToken _dataflowSubscriptionToken;
        private readonly IDispatcher _dispatcher;
        private Action _visibilityChangeAction;

        public bool IsDataflowExceptionsVisible
        {
            get { return GetProperty<bool>(); }
            set
            {
                SetProperty(value);
                if (_visibilityChangeAction != null )
                {
                    _visibilityChangeAction.Invoke();
                }

                if (value)
                {
                    Subscription();
                }
                else
                {
                    UnSubscription();
                }
                _dispatcher.InvokeAsync(() => TestCommand.RaiseCanExecuteChanged());
            }
        }

        private void UnSubscription()
        {
            if (_dataflowSubscriptionToken != null)
            {
                _dataflowSubscriptionToken.Dispose();
                _dataflowSubscriptionToken = null;
            }
        }

        public SegmentModel SelectedSegment
        {
            get { return GetProperty<SegmentModel>(); }

            set
            {
                SetProperty(value);
                _dispatcher.InvokeAsync(() => TestCommand.RaiseCanExecuteChanged());
            }
        }

        public DataflowExceptionsVm(IMessageFeedService messageFeedService, IDispatcher dispatcher, IBuilder builder, IDialogService dialogService, IWebComponentService componentService)
        {
            _dispatcher = dispatcher;
            _messageFeedService = messageFeedService;
            Exceptions = new ObservableCollection<DataflowExceptionModel>();
            ClearExceptionsCommand = new DelegateCommand(() =>
            {
                Exceptions.Clear();
                ClearExceptionsCommand.RaiseCanExecuteChanged();
            }, () => Exceptions.Count > 0);
            TestCommand = DelegateCommand.FromAsyncHandler(
                async () =>
                {
                    var messageTester = builder.Build<MessageTesterVm>();
                    messageTester.Segment = SelectedSegment;
                    if (dialogService.ShowDialog(messageTester,
                        new DialogOptions
                        {
                            ActivateParentAfterClose = true,
                            AutoHideHeader = false,
                            IsHeaderVisible = true,
                            IsTitleVisible = true,
                            Title = "Dataflow message tester"
                        }) == true)
                    {
                        await componentService.TestDataflowMessagesAsync(messageTester.GetMessages());
                    }
                }, () => SelectedSegment != null);
        }

        private void Subscription()
        {
            UnSubscription();
            _dataflowSubscriptionToken = _messageFeedService.Subscribe<DataflowException>(OnDataFlowException);
        }

        private void OnDataFlowException(DataflowException exception)
        {
            _dispatcher.InvokeAsync(() =>
            {
                Exceptions.Add(exception.ToModel());
                ClearExceptionsCommand.RaiseCanExecuteChanged();
            });
        }

        public ObservableCollection<DataflowExceptionModel> Exceptions { get; private set; }

        public DataflowExceptionModel SelectedException
        {
            get { return GetProperty<DataflowExceptionModel>(); }
            set { SetProperty(value); }
        }

        protected override void OnCleanup()
        {
            UnSubscription();
        }

        public DelegateCommand ClearExceptionsCommand { get; set; }

        public DelegateCommand TestCommand { get; set; }

        public void OnVisibilityChange(Action action)
        {
            _visibilityChangeAction = action;
        }
    }
}
