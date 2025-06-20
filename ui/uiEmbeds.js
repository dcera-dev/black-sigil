const { EmbedBuilder } = require('discord.js');

function hpBar(current, max, length = 10) {
    const ratio = current / max;
    const full = Math.round(ratio * length);
    const empty = length - full;
    return '█'.repeat(full) + '░'.repeat(empty);
}

function formatPlayer(player) {
    const hp = hpBar(player.hp, player.maxHp || 100);

    const status = player.statusEffects?.length ?
        player.statusEffects.map(s => `${s.name} (${s.duration}T)`).join(', ')
        : 'None';

    const skills = player.class?.skills?.map((skill, i) => {
        const state = player.skillState[i];
        const cd = state.cooldown > 0 ? `${state.cooldown}T` :
        () => {
            if (state.uses > 0) return '✅'
            else return ''
        };
        const uses = skill.uses !== Infinity ? ` (${state.usesLeft}/${skill.uses})` : '';
        return `- ${skill.name}: ${cd}${uses}`;
    }).join('\n') || '';

    return `**${player.username || 'Waiting...'}**\nClass: ${player.class?.name || 'Unchosen'}\nHP: \`${hp}\` ${player.hp || '—'}/${player.maxHp || '—'}\nStatus: ${status}\n${skills}`;
}

function renderFullDuelEmbed(duel) {
    const embed = new EmbedBuilder()
        .setTitle('Black Sigil')
        .setColor(0x2f3136);
    
    const [p1, p2] = duel.players;
    const phase = duel.phase;

    const nameA = p1?.username || "—";
    const nameB = p2?.username || "—";

    //Waiting for Players
    if (phase === 'join') {
        embed.setDescription(
            `**${duel.choiceA}**\u3000⚔️\u3000**${duel.choiceB}**\n\n` +
            `**${nameA}**\u3000vs\u3000**${nameB}**\n\n`+
            `Two challengers must step forward.`
        );
    }

    //Class Selection
    if (phase === "class") {
        embed.setDescription(`Choose your class.\n\n`);
        embed.addFields(
            { name: p1.username, value: p1.class ? `_Class Locked: ${p1.class.name}_` : `_Select a Class_`, inline: true},
            { name: p2.username, value: p2.class ? `_Class Locked: ${p2.class.name}_` : `_Select a Class_`, inline: true}
        );
    }

    //Active Duel
    else if (phase === 'active') {
        const recentLogs = duel.log.slice(-3).join('\n') || '—';

        embed.addFields(
            {name: 'Player 1', value: formatPlayer(p1), inline: true},
            {name: 'Player 2', value: formatPlayer(p2), inline: true},
            {name: 'Current Turn', value: `<@${duel.turn}>`, inline: false},
            {name: 'Log', value: recentLogs, inline: false}
        );
    }

    //End Screen
    else if (phase === 'ended') {
        const winner = duel.players.find(p => p.hp > 0);
        const winngingChoice = winner?.side === 'A' ? duel.choiceA : duel.choiceB;

        embed.setDescription(
            `**${winngingChoice}**!\n\n`+
            `Champion: **${winner.username}**`
        );
    }

    return embed;
}

module.exports = { renderFullDuelEmbed };