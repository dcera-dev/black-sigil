const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ActionRow } = require('discord.js');

function getDuelComponents(duel, availableClasses = []) {
    const phase = duel.phase;

    //Join Button
    if (phase === 'join') {
        return [
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('join-duel')
                    .setLabel('Join Duel')
                    .setStyle(ButtonStyle.Primary)
            )
        ];
    }

    //Class Selection
    if (phase === 'class') {
        const rows = [];
        duel.players.forEach((player, index) => {
            if (player.class) return;

            const row = new ActionRowBuilder();
            availableClasses.forEach(c => {
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`class-${player.userId}_${c.name}`)
                        .setLabel(c.name)
                        .setStyle(ButtonStyle.Secondary)
                );
            });

            rows.push(row);
        })
        return rows;
    }

    //Active Duel
    if (phase === 'active') {
        const rows = [];
        const current = duel.players.find(p => p.userId === duel.turn)

        if (!current) return [];

        //Basic Actions
        rows.push(
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('duel-attack')
                    .setLabel('Attack')
                    .setStyle(ButtonStyle.Danger),

                new ButtonBuilder()
                    .setCustomId('duel-defend')
                    .setLabel('Defend')
                    .setStyle(ButtonStyle.Primary)
            )
        );

        //Skills
        const skillRow = new ActionRowBuilder();
        current.class.skills.forEach((skill, i) => {
            skillRow.addComponents(
                new ButtonBuilder()
                    .setCustomId(`skill-${i}`)
                    .setLabel(skill.name)
                    .setStyle(ButtonStyle.Secondary)
            );
        });
        
        rows.push(skillRow);
        return rows;
    }

    return [];
}

module.exports = { getDuelComponents };