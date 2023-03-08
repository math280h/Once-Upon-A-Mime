import {Command} from './commands/Command';
import {Hello} from './commands/Hello';
import {MessageHandler} from './messages/MessageHandler';
import {CodeHandler} from './messages/CodeHandler';

export const Commands: Command[] = [
  Hello,
];

export const MessageHandlers: MessageHandler[] = [
  CodeHandler,
];
