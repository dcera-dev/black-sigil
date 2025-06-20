//Imports
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10'}).setToken(process.env.DISCORD_TOKEN);

const route = process.env.GUILD_ID ?
    Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)
    :
    Routes.applicationCommands(process.env.CLIENT_ID);

(async () => {
    try {
        console.log('Registering slash commands...');
        await rest.put(route, { body: commands});
        console.log('Commands registered successfully...');
    }
    catch (error) {
        console.error('Error registering commands: ', error);
    }
})();