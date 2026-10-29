export type Credentials = {
  apiUrl: string;
  idInstance: string;
  apiTokenInstance: string;
};

export type MessageStatus = 'sending' | 'sent' | 'failed';

export type ChatMessage = {
  id: string;
  chatId: string;
  text: string;
  direction: 'incoming' | 'outgoing';
  timestamp: number;
  status?: MessageStatus;
};

export type Chat = {
  id: string;
  title: string;
  subtitle: string;
  messages: ChatMessage[];
  unread: number;
  updatedAt: number;
};

export type IncomingNotification = {
  receiptId: number;
  body: {
    typeWebhook?: string;
    timestamp?: number;
    idMessage?: string;
    senderData?: {
      chatId?: string;
      sender?: string;
      chatName?: string;
      senderName?: string;
      senderContactName?: string;
      senderPhoneNumber?: number;
    };
    messageData?: {
      typeMessage?: string;
      textMessageData?: {
        textMessage?: string;
      };
    };
  };
};
