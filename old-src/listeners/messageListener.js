import { Listener } from "@sapphire/framework";
import { client } from "../index.js";
import { checkMimeType } from "../services/mimeChecker.js";
import { uploadFile } from "../services/fileUploader.js";
import fs from "fs";
import fetch from "node-fetch";

export class MessageListener extends Listener {
  constructor(context, options) {
    super(context, {
      ...options,
      once: false,
      event: "messageCreate",
    });
  }

  async run(message) {
    if (message.author.bot) return;

    // message.attachments is Collection<Snowflake, MessageAttachment>
    const attachments = Array.from(message.attachments.values());
    const msgChannel = message.channel;
    const author = message.author.id;
    const content = message.content;

    // read configuration file
    const configFile = fs.readFileSync("./config.json", "utf-8");
    const config = JSON.parse(configFile);
    const logChannel = config[message.guildId].logChannel;
    const whitelistedMimes = config[message.guildId].whitelist;
    const uploadableMimes = config[message.guildId].uploadableMimes;
    const blockMinSize = config[message.guildId].blockUploadMinSize;

    // handle guild which has not been setup
    if (!config[message.guildId]) {
      message.channel.send(
        "Bot not setup. Refer to: <https://github.com/DracTheDino/Mimey#readme>"
      );
      return;
    }

    // helpful for multiple attachments
    var canDeleteMessage = false;
    var codeBlockUploaded = false;

    const codeBlocks = content.match(/```[a-z0-9\s]{0,10}\n([\s\S]*?)```/gm);


  }
}
