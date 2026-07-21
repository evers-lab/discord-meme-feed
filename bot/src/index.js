// Quelle:  https://discordjs.guide/legacy/app-creation/main-file
// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('../config.json');
const config = require('../config.json'); 		// hinzugefuegt wegen tutorial

// Create a new client instance
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent
	]
});

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, (readyClient) => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});
const channel = client.channels.cache.get("Your channel ID");

// Quelle: https://www.xjavascript.com/blog/discord-js-get-an-array-of-all-messages-in-a-channel/
/**
 * Fetches all messages from a channel by ID.
 * @param {string} channelId - ID of the channel to fetch messages from.
 * @returns {Promise<Array>} Array of message objects.
 */
async function fetchAllMessages(channelId) {
  const channel = await client.channels.fetch(channelId);
 
  // Validate the channel exists and is a text channel
  if (!channel || !channel.isTextBased()) {
    throw new Error('Invalid text channel ID.');
  }
 
  let allMessages = [];
  let lastMessageId = null;
  const limit = 100; // Max messages per request
 
  try {
    // Loop until no more messages are left to fetch
    while (true) {
      const options = { limit, before: lastMessageId };
      const messages = await channel.messages.fetch(options);
 
      if (messages.size === 0) break; // Exit loop if no messages are fetched
 
      allMessages.push(...messages.values());
      lastMessageId = messages.last().id; // Set "before" to the oldest message in the current batch
	  console.log("messages: ", messages);
	  console.log("Last Message ID: ", lastMessageId);
    }
 
    // Reverse to show oldest messages first (optional)
    return allMessages.reverse();
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
}
// Listen for new messages
client.on('messageCreate', async (message) => {
  // Ignore messages from bots to prevent loops
  if (message.author.bot) return;
 
  // Check if the message starts with the prefix (from config.json)
  if (!message.content.startsWith(config.prefix)) return;
 
  // Extract the command (e.g., "!randomquote" → "randomquote")
  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();
 
  // Handle the !randomquote command
  if (command === 'randomquote') {
    try {
      // Fetch all messages from the target channel (from config.json)
      const messages = await fetchAllMessages(config.quoteChannelId);
 
      // Filter out bot messages (optional)
      const userMessages = messages.filter(msg => !msg.author.bot);
 
      if (userMessages.length === 0) {
        return message.reply('No messages found in the quote channel!');
      }
 
      // Pick a random message
      const randomMessage = userMessages[Math.floor(Math.random() * userMessages.length)];
 
      // Send the quote (include author and content)
      message.reply(`🎲 Random quote from ${randomMessage.author.tag}:\n${randomMessage.content}`);
    } catch (error) {
      message.reply(`Error: ${error.message}`);
    }
  }
});
//fetchAllMessages(1382315075045425296);

// Quelle:  https://discordjs.guide/legacy/app-creation/main-file
// Log in to Discord with your client's token
client.login(token);