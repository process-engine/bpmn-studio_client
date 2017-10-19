import {IUserTaskEntity, IUserTaskMessageData} from '@process-engine/process_engine_contracts';
export {IProcessDefEntity, IUserTaskEntity, IUserTaskMessageData} from '@process-engine/process_engine_contracts';

import {IPagination, IProcessDefEntity} from './index';

export interface IProcessEngineService {
  getProcessDefList(limit?: number, offset?: number): Promise<IPagination<IProcessDefEntity>>;
  startProcess(processtoStart: IProcessDefEntity): Promise<ProcessId>;
  getUserTaskList(): Promise<IPagination<IUserTaskEntity>>;
  getUserTaskConfig(userTaskId: UserTaskId): Promise<IUserTaskConfig>;
  proceedUserTask(finishedTask: IUserTaskConfig): Promise<void>;
  cancelUserTask(taskToCancel: IUserTaskConfig): Promise<void>;
}

export interface IProcessEngineRepository {
  getUserTaskData(userTaskId: string): Promise<IUserTaskMessageData>;
}

export type ProcessId = string;
export type UserTaskId = string;

export enum WidgetType {
  form = 'form',
  confirm = 'confirm',
}

// sadly, our current widgetConfigs don't share any similarities
export type IWidgetConfig = {};
export enum FormWidgetFieldType {
  string = 'string',
  boolean = 'boolean',
  enumeration = 'enum',
}

export interface IFormWidgetField<TValue> {
  id: string;
  label: string;
  type: FormWidgetFieldType;
  defaultValue: TValue;
  value?: TValue;
}

export type IFormWidgetStringField = IFormWidgetField<string>;
export type IFormWidgetBooleanField = IFormWidgetField<boolean>;
export interface IFormWidgetEnumValue {
  label: string;
  value: string;
}
export interface IFormWidgetEnumField extends IFormWidgetField<string> {
  enumValues: Array<IFormWidgetEnumValue>;
}

export type SpecificFormWidgetField = IFormWidgetStringField | IFormWidgetBooleanField | IFormWidgetEnumField;

export interface IFormWidgetConfig extends IWidgetConfig {
  fields: Array<SpecificFormWidgetField>;
}

export enum ConfirmWidgetActionType {
  proceed = 'proceed',
  cancel = 'cancel',
}

export interface IConfirmWidgetAction {
  action: ConfirmWidgetActionType;
  label: string;
}

export interface IConfirmWidgetConfig extends IWidgetConfig {
  message: string;
  actions: Array<IConfirmWidgetAction>;
}

export type WidgetConfig = IFormWidgetConfig | IConfirmWidgetConfig;

export interface IUserTaskConfig {
  userTaskEntity: IUserTaskEntity;
  id: string;
  title: string;
  widgetType: WidgetType;
  widgetConfig: WidgetConfig;
}

export interface UiConfigLayoutElement {
  key: string;
  label: string;
  isCancel?: boolean;
}

export interface INodeDefFormFieldValue {
  id: string;
  name: string;
}

export interface INodeDefFormField {
  id: string;
  type: FormWidgetFieldType;
  label: string;
  formValues?: Array<INodeDefFormFieldValue>;
  defaultValue: string;
}
