import {Client, GatewayIntentBits} from 'discord.js';
import ready from './listeners/ready';
import interactionCreate from './listeners/interactionCreate';
import messageCreate from './listeners/messageCreate';
// @ts-ignore
import Pastecord from 'pastecord';
const {token, global, guild_specific} = require('../config.json');

console.log('Bot is starting...');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages],
});

const PastecordClient = new Pastecord();

ready(client);
interactionCreate(client);
messageCreate(client, PastecordClient, {
  global,
  guild_specific
});

client.login(token);
