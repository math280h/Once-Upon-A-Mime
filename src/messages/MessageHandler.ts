import {
  Client,
  Message,
} from 'discord.js';

export interface MessageHandler {
    run: (client: Client, pastecord: any, config: object, message: Message) => void;
}
