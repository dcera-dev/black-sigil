const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('duel')
        .setDescription('Start a Black Sigil duel.')
        .addStringOption(opt => 
            opt.setName('choicea')
                .setDescription('Label for choice A')
                .setRequired(true)
        )
        .addStringOption(opt => 
            opt.setName('choiceb')
                .setDescription('Label for choice B')
                .setRequired(true)
        ),
        async execute(interaction) { },
};

