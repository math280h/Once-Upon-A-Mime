import {
  CommandInteraction,
  Client,
  Interaction, Message,
} from 'discord.js';
import {Commands, MessageHandlers} from '../Interactions';

export default (client: Client, pastecord: any, config: any): void => {
  client.on('messageCreate', async (message: Message) => {
    if (message.author.bot) return;
    if (!message.guild) return;

    await handleMessage(client, pastecord, config, message);
  });
};

const handleMessage = async (
    client: Client,
    pastecord: any,
    config: any,
    message: Message): Promise<void> => {
  MessageHandlers.forEach((handler) => {
    handler.run(client, pastecord, config, message);
  });
};
