import {EventEmitter2} from 'eventemitter2';
import {
  ConfirmAction,
  FormWidgetFieldType,
  IConfirmWidgetAction,
  IConfirmWidgetConfig,
  IDataMessage,
  IFormWidgetBooleanField,
  IFormWidgetConfig,
  IFormWidgetEnumField,
  IFormWidgetEnumValue,
  IFormWidgetField,
  IFormWidgetStringField,
  IMessage,
  IMessageBusService,
  INodeDefFormField,
  INodeDefFormFieldValue,
  IPagination,
  IProcessDefEntity,
  IProcessEngineRepository,
  IProcessEngineService,
  ITokenRepository,
  IUserTaskConfig,
  IUserTaskEntity,
  IUserTaskMessageData,
  ProcessId,
  SpecificFormWidgetField,
  UiConfigLayoutElement,
  UserTaskId,
  UserTaskProceedAction,
  WidgetConfig,
  WidgetType,
} from '../contracts/index';

export class ProcessEngineService extends EventEmitter2 implements IProcessEngineService {

  private processEngineRepository: IProcessEngineRepository;
  private messageBusService: IMessageBusService;
  private tokenRepository: ITokenRepository;

  constructor(processEngineRepository: IProcessEngineRepository, messageBusService: IMessageBusService, tokenRepository: ITokenRepository) {
    super({wildcard: true});
    this.processEngineRepository = processEngineRepository;
    this.messageBusService = messageBusService;
    this.tokenRepository = tokenRepository;
  }

  public initialize(): void {
    const eventHandler: Function = (channelName: string, ...parameter: Array<any>): void => {
      if (!this.isAllowedToHandle(channelName)) {
        return;
      }

      let event: string = channelName;
      const message: IMessage = parameter[0];
      if (this.messageBusService.messageIsDataMessage(message)) {
        const messageIsUserTask = message.data &&
                                  message.data.action === 'userTask';

        if (messageIsUserTask) {
          event = 'renderUserTask';
          parameter[0] = this.getUserTaskConfigFromUserTaskData(message.data.data);
        }
      }

      this.emit(event, ...parameter);
    };

    this.messageBusService.on('*', function(...parameter: Array<any>): void {
      eventHandler(this.event, ...parameter);
    });
  }

  public getProcessDefList(limit: number = 100, offset: number = 0): Promise<IPagination<IProcessDefEntity>> {
    return this.processEngineRepository.getProcessDefList(limit, offset);
  }

  public startProcessById(processDefId: string): Promise<ProcessId> {
    return this.processEngineRepository.startProcessById(processDefId);
  }

  public startProcessByKey(processDefKey: string): Promise<ProcessId> {
    return this.processEngineRepository.startProcessByKey(processDefKey);
  }

  public getUserTaskList(): Promise<IPagination<IUserTaskEntity>> {
    return this.processEngineRepository.getUserTaskList();
  }

  public getUserTaskListByProcessDefId(processDefId: string): Promise<IPagination<IUserTaskEntity>> {
    return this.processEngineRepository.getUserTaskListByProcessDefId(processDefId);
  }

  public getUserTaskListByProcessInstanceId(processInstanceId: string): Promise<IPagination<IUserTaskEntity>> {
    return this.processEngineRepository.getUserTaskListByProcessInstanceId(processInstanceId);
  }

  public async getUserTaskConfig(userTaskId: UserTaskId): Promise<IUserTaskConfig> {
    const userTaskData: IUserTaskMessageData = await this.processEngineRepository.getUserTaskData(userTaskId);

    return this.getUserTaskConfigFromUserTaskData(userTaskData);
  }

  public widgetConfigIsFormWidgetConfig(widgetConfig: WidgetConfig): widgetConfig is IFormWidgetConfig {
    return (<any> widgetConfig).fields !== undefined && (<any> widgetConfig).fields !== null;
  }

  public proceedUserTask(finishedTask: IUserTaskConfig, proceedAction?: UserTaskProceedAction): Promise<void> {

    const userTaskResult: any = {};
    if (finishedTask.widgetType === WidgetType.form) {
      const formConfig: IFormWidgetConfig = <IFormWidgetConfig> finishedTask.widgetConfig;
      for (const field of formConfig.fields) {
        userTaskResult[field.id] = field.value;
      }
    }

    if (finishedTask.widgetType === WidgetType.confirm) {
      const confirmConfig: IConfirmWidgetConfig = <IConfirmWidgetConfig> finishedTask.widgetConfig;
      if (proceedAction === UserTaskProceedAction.cancel) {
        userTaskResult.key = ConfirmAction.decline;
      } else {
        userTaskResult.key = ConfirmAction.confirm;
      }
    }
    const messageData: any = {
      action: 'proceed',
      token: userTaskResult,
    };

    const proceedMessage: IDataMessage = this.messageBusService.createDataMessage(messageData);

    return this.messageBusService.sendMessage(`/processengine/node/${finishedTask.id}`, proceedMessage);
  }

  private getUserTaskConfigFromUserTaskData(userTaskData: IUserTaskMessageData): IUserTaskConfig {
    const result: IUserTaskConfig = {
      userTaskEntity: userTaskData.userTaskEntity,
      id: userTaskData.userTaskEntity.id,
      title: userTaskData.userTaskEntity.name,
      widgetType: null,
      widgetConfig: null,
    };

    if (userTaskData.uiName === 'Form') {
      result.widgetType = WidgetType.form;
      result.widgetConfig = this.getFormWidgetConfigFromUserTaskData(userTaskData);
    }

    if (userTaskData.uiName === 'Confirm') {
      result.widgetType = WidgetType.confirm;
      result.widgetConfig = this.getConfirmWidgetConfigFromUserTaskData(userTaskData);
    }

    return result;

  }

  public formWidgetFieldIsEnum(formWidgetField: IFormWidgetField<any>): formWidgetField is IFormWidgetEnumField {
    return formWidgetField.type === FormWidgetFieldType.enumeration;
  }

  public getFormWidgetConfigFromUserTaskData(userTaskData: IUserTaskMessageData): IFormWidgetConfig {
    const formWidgetConfig: IFormWidgetConfig = {
      fields: null,
    };

    const nodeDefFormFields: Array<INodeDefFormField> = userTaskData.userTaskEntity.nodeDef.extensions.formFields;
    formWidgetConfig.fields = nodeDefFormFields.map((nodeDefFormField: INodeDefFormField): SpecificFormWidgetField => {
      const result: SpecificFormWidgetField = {
        id: nodeDefFormField.id,
        label: nodeDefFormField.label,
        type: nodeDefFormField.type,
        defaultValue: nodeDefFormField.defaultValue,
      };

      if (this.formWidgetFieldIsEnum(result)) {
        result.enumValues = nodeDefFormField.formValues.map((formValue: INodeDefFormFieldValue): IFormWidgetEnumValue => {
          const enumEntry: IFormWidgetEnumValue = {
            label: formValue.name,
            value: formValue.id,
          };

          return enumEntry;
        });
      }

      return result;
    });

    return formWidgetConfig;
  }

  public getConfirmWidgetConfigFromUserTaskData(userTaskData: IUserTaskMessageData): IConfirmWidgetConfig {
    const confirmWidgetConfig: IConfirmWidgetConfig = {
      message: userTaskData.uiConfig.message,
      actions: null,
    };

    confirmWidgetConfig.actions = userTaskData.uiConfig.layout.map((action: UiConfigLayoutElement): IConfirmWidgetAction => {
      const confirmAction: IConfirmWidgetAction = {
        label: action.label,
        action: null,
      };

      if (action.key === 'confirm') {
        confirmAction.action = UserTaskProceedAction.proceed;
      } else if (action.key === 'cancel' || action.isCancel === true) {
        confirmAction.action = UserTaskProceedAction.cancel;
      }

      return confirmAction;
    });

    return confirmWidgetConfig;
  }

  private isAllowedToHandle(channel: string): boolean {
    let roles: Array<string> = ['guest']; // default roles
    if (this.tokenRepository.getIdentity()) {
      roles = this.tokenRepository.getIdentity().roles;
    }

    const rolePrefix: string = '/role/';
    if (!channel.startsWith(rolePrefix)) {
      return true;
    }

    const handledRole: string = channel.substr(rolePrefix.length);

    return roles.includes(handledRole);
  }
}
