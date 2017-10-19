import {ExecutionContext, HttpMethod, IPojoEntityReference} from '@essential-projects/core_contracts';
import {IDataMessage} from '@essential-projects/messagebus_contracts';
import {ISecurityType} from '@essential-projects/security_service_contracts';
export {IMessage, IDataMessage} from '@essential-projects/messagebus_contracts';

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
