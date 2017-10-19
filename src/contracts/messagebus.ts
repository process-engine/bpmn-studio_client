import {ExecutionContext, HttpMethod, IPojoEntityReference} from '@essential-projects/core_contracts';
import {ISecurityType} from '@essential-projects/security_service_contracts';

export interface IMessageBusService {
  createDataMessage(data: any): IDataMessage;
  sendMessage(channel: string, message: any): Promise<any>;
  registerMessageHandler(handler: (channel: string, message: any) => void): void;
  removeMessageHandler(handler: (channel: string, message: any) => void): void;
}

export enum MessageAction {
  event = 'event',
  abort = 'abort',
  proceed = 'proceed',
}

export enum MessageEventType {
  cancel = 'cancel',
  proceed = 'proceed',
  decline = 'decline',
}

export interface IDatastoreMessageOptions {
  action: HttpMethod;
  typeName?: string;
  method?: string;
  id?: string;
  options?: any;
}

export interface IDatastoreMessage extends IDataMessage, IDatastoreMessageOptions {

}

export interface IEntityMessage extends IDataMessage {
  source: IPojoEntityReference;
}

export interface IDataMessage extends IMessage {
  data: any;
}

export interface IErrorMessage extends IMessage {
  error: any;
  message: string;
}

export interface IMessage {
  metadata?: IMessageMetadata;
}

export interface IMessageMetadata {
  id?: string;
  applicationId?: string;
  token: string;
  context?: ExecutionContext;
  response?: string;
  encryptionType?: ISecurityType;
  options?: { [key: string]: any };
}
