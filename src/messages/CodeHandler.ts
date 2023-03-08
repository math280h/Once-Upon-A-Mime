import {Client, Message, TextChannel} from 'discord.js';
import {MessageHandler} from './MessageHandler';
import { fromStream } from "file-type";
import got from 'got';

async function checkMimeType(attachmentUrl: any) {
  return await fromStream(await got.stream(attachmentUrl));
}

export const CodeHandler: MessageHandler = {
  run: async (client: Client, pastecord: any, config: any, message: Message) => {
    if (message.guildId === null) return;

    let whitelist;
    if (config.guild_specific[message.guildId]["whitelist"] !== undefined) {
        whitelist = [...config.global["whitelist"], ...config.guild_specific[message.guildId]["whitelist"]];
    } else {
        whitelist = config.global["whitelist"];
    }

    const logChannel: TextChannel = client.channels.cache
        .get('1055924963523174410') as TextChannel;

    const attachments = Array.from(message.attachments.values());


    let canDeleteMessage = false;
    let codeBlockUploaded = false;
    const codeBlocks = message.content.match(/```[a-z0-9\s]{0,10}\n([\s\S]*?)```/gm);
    let blockMinSize = config.global["blockUploadMinSize"];

    // loop through every attachment in message if there are any
    if (attachments.length >= 1) {
      const finalReplyMessage = [
        `Hey <@${message.author.id}>, your file(s) have been uploaded to Pastecord.`,
      ];
      // Check FIRST, before we loop through any files if message includes any code blocks at all.
      if (codeBlocks !== null) {
        const codeblocksToBeRemoved = [];
        // @ts-ignore
          for (const [index, block] of codeBlocks.entries()) {
          const codeArray = block.split('\n');
          codeblocksToBeRemoved.push(block);

          if (codeArray.length >= blockMinSize) {
            codeArray.splice(0, 1);
            const formattedCode = codeArray.join('\n');
            const url = await pastecord.publish(formattedCode).url;
            codeBlockUploaded = true;
            // const url = "Fake Upload"; //For dev purposes
            finalReplyMessage.push(`**Code snippet [${index + 1}]:** ${url}`);

            await logChannel.send(
                `Deleted large code block from user <@${message.author.id}> in <#${message.channelId}>. Uploaded to Pastecord: ${url}`
            );
          } else {
            const formattedCode = codeArray.join('\n');
            finalReplyMessage.push(
                `**Code snippet [${index + 1}]:** ${formattedCode}`
            );
          }
        }

        // if content before or after code block
        let finalMessageContent = message.content;
        for (const snippet of codeblocksToBeRemoved) {
          finalMessageContent = finalMessageContent.replace(snippet, '');
        }

        if (finalMessageContent.length > 1) {
          finalReplyMessage.push(
              `**Message text content:** \`\`\`\n${finalMessageContent}\`\`\``
          );
        }
      }

      for (const attachment of attachments) {
        const fileName = attachment.name;
        const fileUrl = attachment.url;

        const mime = await checkMimeType(fileUrl);

        if (whitelist.includes(mime)) {
          canDeleteMessage = true;

          const response = await fetch(fileUrl);
          const body = await response.text();
          const url = await pastecord.publish(body).url;
          codeBlockUploaded = true;
          // const url = `${fileName}.uploaded`; //For dev purposes
          finalReplyMessage.push(`**${fileName}:** ${url}`);

          await logChannel
              .send(
                  `Deleted file \`${fileName}\` of type \`${mime}\` from user <@${message.author.id}> in <#${message.channelId}>. Pastecord: ${url}`
              );
        }
        // We have a code block and an image.
        else if (whitelist.includes(mime) && codeBlockUploaded) {
          canDeleteMessage = true;
        }

        // if that fails, check if its whitelisted
        else if (!whitelist.includes(mime)) {
          canDeleteMessage = true;

          await message.reply(
              `Hey <@${message.author.id}>, please don't upload \`${mime}\` files on this server.`
          );

          await logChannel
              .send(
                  `Deleted file \`${fileName}\` of type \`${mime}\` from user <@${message.author.id}> in <#${message.channelId}>.`
              );
        }
      }

      if (codeBlockUploaded) {
        const fullReplyMessage = finalReplyMessage.join('\n');
        await message.reply({
          content: fullReplyMessage,
          allowedMentions: {
            users: [message.author.id],
          },
        });
      }
    }

    // Upload Code Snippet if the block is larger than configured line amount.
    if (attachments.length < 1 && codeBlocks !== null) {
      let shouldSendMessage = false;
      const finalReplyMessage = [
        `Hey <@${message.author.id}>, your file(s) have been uploaded to Pastecord.`,
      ];

      const codeblocksToBeRemoved = [];
      // @ts-ignore
        for (const [index, block] of codeBlocks.entries()) {
        const codeArray = block.split('\n');
        codeblocksToBeRemoved.push(block);

        if (codeArray.length >= blockMinSize) {
          shouldSendMessage = true;
          codeArray.splice(0, 1);
          const formattedCode = codeArray.join('\n');
          const upload = await pastecord.publish(formattedCode);
          // const url = "Fake Upload";  //For Dev purposes
          finalReplyMessage.push(`**Code snippet [${index + 1}]:** ${upload.url}`);

          await logChannel
              .send(
                  `Deleted large code block from user <@${message.author.id}> in <#${message.channelId}>. Uploaded to Pastecord: ${upload.url}`
              );
          canDeleteMessage = true;
        } else {
          finalReplyMessage.push(`**Code snippet [${index + 1}]:**\n${block}`);
        }
      }

      // grab any other content than code blocks
      let finalMessageContent = message.content;
      for (const snippet of codeblocksToBeRemoved) {
        finalMessageContent = finalMessageContent.replace(snippet, '');
      }

      // Check there is anything other than code blocks to send back.
      if (finalMessageContent.length > 1) {
        finalReplyMessage.push(
            `**Message text content:** \`\`\`\n${finalMessageContent}\`\`\`\n`
        );
      }

      // If anything has been uploaded, this should be true and will reply.
      if (shouldSendMessage) {
        const fullReplyMessage = finalReplyMessage.join('\n');
        await message.reply({
          content: fullReplyMessage,
          allowedMentions: {
            users: [message.author.id],
          },
        });
      }
    }

    // you had two chances, attachment, and if you failed both chances... forever begone!
    if (canDeleteMessage) {
      await message.delete();
    }
  },
};
