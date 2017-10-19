import {IUserTaskEntity} from '@process-engine/process_engine_contracts';
export {IProcessDefEntity, IUserTaskEntity} from '@process-engine/process_engine_contracts';

export type ProcessId = string;
export type UserTaskId = string;

export enum WidgetType {
  form = 'form',
  confirm = 'confirm',
}

// sadly, our current widgetConfigs don't share any similarities
export type IWidgetConfig = {};

export interface IFormWidgetField<TValue> {
  id: string;
  label: string;
  type: 'string' | 'boolean' | 'enum';
  defaultValue: TValue;
  value: TValue;
}

export interface IFormWidgetStringField extends IFormWidgetField<string> {
  type: 'string';
}
export interface IFormWidgetBooleanField extends IFormWidgetField<boolean> {
  type: 'boolean';
}
export interface IFormWidgetEnumField extends IFormWidgetField<string> {
  type: 'enum';
  enumValues: [{
    label: string;
    value: string;
  }];
}

export type SpecificFormWidgetField = IFormWidgetStringField | IFormWidgetBooleanField | IFormWidgetEnumField;

export interface IFormWidgetConfig extends IWidgetConfig {
  fields: Array<SpecificFormWidgetField>;
}

export enum ConfirmWidgetAction {
  proceed = 'proceed',
  cancel = 'cancel',
}

export interface IConfirmWidgetConfig extends IWidgetConfig {
  message: string;
  actions: [{
    action: ConfirmWidgetAction,
    label: string,
  }];
}

export type WidgetConfig = IFormWidgetConfig | IConfirmWidgetConfig;

export interface IUserTaskConfig {
  userTaskEntity: IUserTaskEntity;
  id: string;
  title: string;
  widgetType: WidgetType;
  widgetConfig: WidgetConfig;
}
