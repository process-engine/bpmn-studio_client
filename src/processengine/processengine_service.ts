import {
  ConfirmWidgetActionType,
  FormWidgetFieldType,
  IConfirmWidgetAction,
  IConfirmWidgetConfig,
  IFormWidgetBooleanField,
  IFormWidgetConfig,
  IFormWidgetEnumField,
  IFormWidgetEnumValue,
  IFormWidgetField,
  IFormWidgetStringField,
  INodeDefFormField,
  INodeDefFormFieldValue,
  IPagination,
  IProcessDefEntity,
  IProcessEngineRepository,
  IProcessEngineService,
  IUserTaskConfig,
  IUserTaskEntity,
  IUserTaskMessageData,
  ProcessId,
  SpecificFormWidgetField,
  UiConfigLayoutElement,
  UserTaskId,
  WidgetType,
} from '../contracts/index';

export class ProcessEngineService implements IProcessEngineService {

  private processEngineRepository: IProcessEngineRepository;

  constructor(processEngineRepository: IProcessEngineRepository) {
    this.processEngineRepository = processEngineRepository;
  }
  public getProcessDefList(limit: number = 100, offset: number = 0): Promise<IPagination<IProcessDefEntity>> {
    return this.processEngineRepository.getProcessDefList(limit, offset);
  }

  public startProcess(processToStart: IProcessDefEntity): Promise<ProcessId> {
    return this.processEngineRepository.startProcess(processToStart);
  }

  public getUserTaskList(): Promise<IPagination<IUserTaskEntity>> {
    return this.processEngineRepository.getUserTaskList();
  }

  public async getUserTaskConfig(userTaskId: UserTaskId): Promise<IUserTaskConfig> {
    const userTaskData: IUserTaskMessageData = await this.processEngineRepository.getUserTaskData(userTaskId);

    return this.getUserTaskConfigFromUserTaskData(userTaskData);
  }

  public proceedUserTask(finishedTask: IUserTaskConfig): Promise<void> {
    throw new Error('not implemented');
    /*

    const messageToken: any = {};
    if (widget.type === 'form') {
      for (const field of (widget as IFormWidget).fields) {
        messageToken[field.id] = field.value;
      }
    }

    if (widget.type === 'confirm') {
      if (action === 'abort') {
        messageToken.key = 'decline';
      } else {
        messageToken.key = 'confirm';
      }
    }

    const messageData: any = {
      action: 'proceed',
      token: messageToken,
    };

    const message: IMessage = this.messageBusService.createMessage(messageData, token);
    const messageToken: any = this.getMessageToken(widget, action);

    this.messageBusService.sendMessage(`/processengine/node/${widget.taskEntityId}`, message);
    */
  }

  public cancelUserTask(taskToCancel: IUserTaskConfig): Promise<void> {
    throw new Error('not implemented');
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

  private formWidgetFieldIsEnum(formWidgetField: IFormWidgetField<any>): formWidgetField is IFormWidgetEnumField {
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
        confirmAction.action = ConfirmWidgetActionType.proceed;
      } else if (action.key === 'confirm' || action.isCancel === true) {
        confirmAction.action = ConfirmWidgetActionType.cancel;
      }

      return confirmAction;
    });

    return confirmWidgetConfig;
  }
}
