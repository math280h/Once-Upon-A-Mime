import {Client} from 'discord.js';
import {Commands} from '../Interactions';

export default (client: Client): void => {
  client.on('ready', async () => {
    if (!client.user || !client.application) {
      return;
    }

    try {
      console.log(
          `Started refreshing ${Commands.length} application (/) commands.`
      );

      await client.application.commands.set(Commands);

      console.log(
          `Successfully reloaded ${Commands.length} application (/) commands.`
      );
    } catch (error) {
      console.error(error);
    }

    console.log(`${client.user.username} is online`);
  });
};
