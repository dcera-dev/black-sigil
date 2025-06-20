const duelManager = require('../lib/duel-manager');
const { createDuelContext } = require('../lib/duelContext');
const classes = require('../data/classes');
const { renderFullDuelEmbed } = require('../ui/uiEmbeds');
const { getDuelComponents } = require('../ui/uiComponents');
const skillHandlers = require('../lib/skillHandler');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        const { channel, user, customId } = interaction;
        const channelId = channel.id;
        const userId = user.id;

        //Start Command

        if (interaction.isChatInputCommand() && interaction.commandName === 'duel') {
            const subcommand = interaction.options.getSubcommand();

            if (subcommand === 'start') {
                const choiceA = interaction.options.getString('choicea');
                const choiceB = interaction.options.getString('choiceb');

                const duel = duelManager.createDuel(channelId, choiceA, choiceB);

                //Timeout
                duel.timeout = setTimeout(async () => {
                    duelManager.endDuel(channelId);
                    try {
                        await channel.send(`The duel timed out, not enough challengers appeared.`);
                    }
                    catch (err) {
                        console.error("Timeout messaged failed: ", err);
                    }
                }, 5 * 60 * 1000);

                message = await interaction.reply({
                    embeds: [renderFullDuelEmbed(duelManager.getDuel(channelId))],
                    components: getDuelComponents(duel, classes),
                    fetchReply: true
                });

                duel.messageId = message.id;

                return;
            }

            if (subcommand === 'cancel') {
                const issuerId = interaction.user.id;
                const isPlayer = duelManager.isPlayer(channel, issuerId);
                const isMod = member.permissions?.has('ManageMessages');

                if (!isPlayer && !isMod) {
                    return interaction.reply({ content: "insufficient permissions", ephemeral: true });
                }

                if (duel.timeout) clearTimeout(duel.timeout);
                const success = duelManager.endDuel(channelId);

                if (success) {
                    await channel.send(`The duel has been cancelled.`);
                    return interaction.reply({ content: "Duel cancelled.", emphermal: true });
                }
                else return interaction.reply({ content: "No duel to cancel.", emphermal: true });
            }
        }

        //Button Interactions
        if (!interaction.isButton()) return;

        const ctx = createDuelContext(channelId);
        if (!ctx.duel) return interaction.reply({ content: "No duel found.", ephemeral: true });

        const duel = ctx.duel;
        const opponent = ctx.player('opponent');
        const player = ctx.player();

        //Join Button
        if (customId === 'join-duel') {
            const member = await interaction.guild.members.fetch(userId);
            const success = duelManager.joinDuel(channelId, userId, member.displayName);
            if (!success) {
                return interaction.reply({ content: "Couldn't Join Duel", ephemeral: true });
            }

            const allJoined = duel.players.length === 2;

            if (allJoined) {
                if (duel.timeout) {
                    clearTimeout(duel.timeout);
                    duel.timeout = null;
                }
                duel.phase = 'class';
            }

            const message = await channel.messages.fetch(duel.messageId);
            await message.edit({
                embeds: [renderFullDuelEmbed(duel)],
                components: getDuelComponents(duel, classes)
            });
            await interaction.deferUpdate();

            return;
        }

        //Class Selection
        if (customId.startsWith('class-')) {
            const className = customId.slice(6).split('_')[1];
            const classData = classes.find(n => n.name === className);
            if (!classData) return interaction.reply({ content: "Invalid Class!", ephemeral: true });

            const success = duelManager.setClass(channelId, userId, classData);
            if (!success) return interaction.reply({ content: "Failed to set class, did you already pick one?", ephemeral: true });

            if (duelManager.bothClassesSelected(channelId)) {
                duelManager.startDuel(channelId);
            }

            const message = await channel.messages.fetch(duel.messageId);
            await message.edit({
                embeds: [renderFullDuelEmbed(duel)],
                components: getDuelComponents(duel, classes)
            });
            await interaction.deferUpdate();

            return;
        }

        //Ensure it is the players turn
        if (duel.turn !== userId) {
            return interaction.reply({ content: "Not your turn.", ephemeral: true});
        }

        //Attack
        if (customId === 'duel-attack') {
            const { damage, reflect, evade } = ctx.applyDamage(opponent, ctx.player().class.baseDamage);
            opponent.hp -= damage;

            if (evade) ctx.log(`${player.username} attacked ${opponent.username}, but they evaded.`);
            else if (reflect) {
                const reflectedDamage = ctx.applyDamage(player, 5);
                ctx.log(`${player.username} struck ${opponent.username} for ${damage} damage, but had ${reflectedDamage} reflected back.`);
            }
            else ctx.log(`${player.username} hit ${opponent.username} for ${damage} damage.`);

            const next = ctx.advanceTurn();
            next ? ctx.log(`${next.username}'s turn!`) : ctx.log(`Duel Ended.`);

            const message = await channel.messages.fetch(duel.messageId);
            await message.edit({
                embeds: [renderFullDuelEmbed(duel)],
                components: getDuelComponents(duel, classes)
            });
            await interaction.deferUpdate();

            return;
        }

        //Defend
        if (customId === 'duel-defend') {
            switch(player.class.name) {
                case "Knight":
                    ctx.addStatus(player, { name: "guard", duration: 1});
                    ctx.log(`${player.username} raises their shield.`);
                    break
                case "Assassin":
                    ctx.addStatus(player, { name: 'evade', duration: 1});
                    ctx.log(`${player.username} prepares to dodge.`);
                    break
                case "Pyromancer":
                    ctx.addStatus(player, { name: 'flame-shield', duration: 1});
                    ctx.log(`${player.username} raises a cloak of fire around their body.`);
                    break
                default: ctx.log('error');
            }
            const next = ctx.advanceTurn();
            next ? ctx.log(`${next.username}'s turn!`) : ctx.log(`Duel Ended.`);

            const message = await channel.messages.fetch(duel.messageId);
            await message.edit({
                embeds: [renderFullDuelEmbed(duel)],
                components: getDuelComponents(duel, classes)
            });
            await interaction.deferUpdate();

            return;
        }

        //Skills
        if (customId.startsWith('skill-')) {
            const skillIndex = customId.slice(6);
            const skillName = player.skillState[skillIndex].name

            if (!ctx.canUseSkill(player, skillIndex)) {
                return interaction.reply({ content: "Skill unavailable or on cooldown.", ephemeral: true });
            }

            const classData = classes.find(c => c.name === player.class.name);
            ctx.useSkill(player, skillName, classData);

            const result = skillHandlers[skillName]?.(ctx);
            if (result) ctx.log(result);

            const next = ctx.advanceTurn();
            next ? ctx.log(`${next.username}'s turn!`) : ctx.log(`Duel Ended.`);

            const message = await channel.messages.fetch(duel.messageId);
            await message.edit({
                embeds: [renderFullDuelEmbed(duel)],
                components: getDuelComponents(duel, classes)
            });
            await interaction.deferUpdate();

            return;
        }

        //Fallback
        return interaction.reply({ content: "Unknown command.", ephemeral: true });
    }
}