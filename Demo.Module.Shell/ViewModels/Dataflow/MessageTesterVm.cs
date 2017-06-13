using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Documents;
using Graphnet.Core.Utilities;
using Graphnet.Dashboard.CoreUI.Models;
using Graphnet.Dashboard.WebContracts.Dataflow;
using Graphnet.Wpf.Presentation.Infrastructure;
using Graphnet.Wpf.Presentation.Infrastructure.Commands;
using Graphnet.Wpf.Presentation.Infrastructure.Services.Interfaces;
using Graphnet.Wpf.Presentation.Infrastructure.Settings;

namespace Graphnet.Dashboard.CoreUI.ViewModels.Dataflow
{
    class MessageTesterVm : ViewModelBase
    {
        private readonly IDialogService _dialogService;
        private readonly ISettingsProvider _settingsProvider;
        private bool _isInitializingFromTemplate;
        private List<TestHistoryModel> _templateHistory;
        private bool _IsInitilized;


        public MessageTesterVm(IDialogService dialogService, ISettingsProvider settingsProvider)
        {
            _dialogService = dialogService;
            _settingsProvider = settingsProvider;
            Messages = new ObservableCollection<MessageModel>();

            TestCommand = new DelegateCommand(() => _dialogService.Close(this, true), () => MessageCount >0);

            SaveTestCommand = new DelegateCommand(() =>
            {
                 SaveCurrentTemplate();
                
                _dialogService.Close(this, true);
            }, () => MessageCount > 0 && !string.IsNullOrEmpty(TemplateName));

            CancelCommand = new DelegateCommand(() => _dialogService.Close(this, false), () => true);
        }

        private void SaveCurrentTemplate()
        {
            var testTemplate = new TestHistoryModel
            {
                MessagesMetadata = GetMessages(),
                TemplateName = TemplateName
            };

            if (_templateHistory == null)
            {
                _templateHistory = new List<TestHistoryModel>();
            }
            else
            {
                var itemsToRemove = _templateHistory.Where(
                    x =>
                        x.MessagesMetadata.MessageType == testTemplate.MessagesMetadata.MessageType &&
                        x.TemplateName.Equals(testTemplate.TemplateName, StringComparison.OrdinalIgnoreCase)).ToList();

                itemsToRemove.ForEach(x=>_templateHistory.Remove(x));
            }

            _templateHistory.Add(testTemplate);

            _templateHistory.Reverse();

            var historyToSave =_templateHistory.Take(10).ToList();

            _settingsProvider.SaveSettings(historyToSave);

        }

        protected override async Task OnInitialize()
        {
            if (!_IsInitilized)
            {
                _IsInitilized = true;
                InitializeData();
                await base.OnInitialize();
            }
        }

        private void InitializeData()
        {
            var messageType = Segment.MessageMetadata.MessageType;
            
            var defaultTemplate = new TestHistoryModel
            {
                TemplateName = "Default",
                MessagesMetadata = new DataflowMessageWrapper(){MessageType = messageType}
            };

            History = new List<TestHistoryModel> {defaultTemplate};

            // Read the local repository
            _templateHistory = _settingsProvider.GetSettings<List<TestHistoryModel>>();

            if (_templateHistory != null)
            {
                // Filter the repository for current message type
                var filteredHistory = _templateHistory.Where(x => x.MessagesMetadata.MessageType == messageType).ToList();
                
                History.AddRange(filteredHistory);
            }

            SelectedHistory = History.FirstOrDefault();
        }

        public SegmentModel Segment { get; set; }

        public DelegateCommand TestCommand { get; private set; }

        public DelegateCommand CancelCommand { get; private set; }

        public DataflowMessageWrapper GetMessages()
        {
            var messages = Messages.Select(x=>x.Message).ToList();
            var wrapper = new DataflowMessageWrapper
            {
                MessageType = Segment.MessageMetadata.MessageType,
                SerializedMessages = JsonObjectConverter.SerializeObject(messages)
            };
            return wrapper;
        }

        public int MessageCount
        {
            get { return GetProperty<int>(); }
            set
            {
                SetProperty(value);

                if (!_isInitializingFromTemplate)
                {
                    while (Messages.Count > value)
                    {
                        Messages.RemoveAt(Messages.Count - 1);
                    }

                    while (Messages.Count < value)
                    {
                        var message = BuildNewMessage();
                        message.DisplayName = string.Format("{0} {1}", message.Message.GetType().Name,
                            Messages.Count + 1);
                        Messages.Add(message);
                        
                    }
                }

                TestCommand.RaiseCanExecuteChanged();
                SaveTestCommand.RaiseCanExecuteChanged();
                SelectedMessage = Messages.FirstOrDefault();
            }
        }

        private MessageModel BuildNewMessage()
        {
            var messageType = Segment.MessageMetadata.MessageType;
            var data = JsonObjectConverter.SerializeObject(TemplateMessage);
            var message = JsonObjectConverter.DeserializeObject(data,messageType) as IDataflowMessage;
            return new MessageModel {Message = message};
        }

        public string TemplateName
         {
             get { return GetProperty<string>(); }
            set
            {
                SetProperty(value); 
                SaveTestCommand.RaiseCanExecuteChanged();
            }
         }

        public TestHistoryModel SelectedHistory
        {
            get { return GetProperty<TestHistoryModel>(); }
            set
            {
                SetProperty(value);
                _isInitializingFromTemplate = true;
                TemplateMessage = Activator.CreateInstance(value.MessagesMetadata.MessageType) as IDataflowMessage;
                Messages = new ObservableCollection<MessageModel>(value.GetMessageModel());
                MessageCount = Messages.Count;
                if (!value.TemplateName.Equals("Default"))
                {
                    TemplateName = value.TemplateName;
                }
                _isInitializingFromTemplate = false;
            }
        }

        public List<TestHistoryModel> History
        {
            get { return GetProperty<List<TestHistoryModel>>(); }
            private set { SetProperty(value); }
        }

        public ObservableCollection<MessageModel> Messages
        {
            get { return GetProperty<ObservableCollection<MessageModel>>(); }
            set { SetProperty(value); }
        }

        public MessageModel SelectedMessage
         {
             get { return GetProperty<MessageModel>(); }
             set { SetProperty(value); }
         }

         public IDataflowMessage TemplateMessage
         {
             get { return GetProperty<IDataflowMessage>(); }
             set { SetProperty(value); }
         }

         public DelegateCommand SaveTestCommand { get; private set; }
    }
}
