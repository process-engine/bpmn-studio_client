export interface IMessageBusService {
  createMessage(): any;
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

export interface IMessage {
  action: MessageAction;
  context: {
    participantId: string,
  };
  eventType: MessageEventType;
}
