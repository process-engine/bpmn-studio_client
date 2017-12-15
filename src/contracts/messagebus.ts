import {ExecutionContext, HttpMethod, IPojoEntityReference} from '@essential-projects/core_contracts';
import {IDataMessage} from '@essential-projects/messagebus_contracts';
import {ISecurityType} from '@essential-projects/security_service_contracts';
import {EventEmitter2} from 'eventemitter2';
export {IMessage, IDataMessage} from '@essential-projects/messagebus_contracts';

export interface IMessageBusService extends EventEmitter2 {
  createDataMessage(data: any, participantId?: string): IDataMessage;
  sendMessage(channel: string, message: any): Promise<any>;
  messageIsDataMessage(message: any): message is IDataMessage;
  updateConfig(config: any): void;
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
