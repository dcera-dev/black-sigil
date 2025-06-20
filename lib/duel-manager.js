const duels = new Map();

function createDuel(channelId, choiceA, choiceB) {
    const duel = {
        phase: 'join', //join, class, active, end
        channelId,
        turn: null,
        players: [],
        choiceA,
        choiceB,
        log: ['Waiting for players...'],
        messageId: null
    }
    duels.set(channelId, duel);
    return duel
    }

    function getDuel(channelId) {
        return duels.get(channelId);
    }

    function endDuel(channelId) {
        duels.delete(channelId);
    }

    function joinDuel(channelId, userId, username) {
        const duel = getDuel(channelId);
        if (!duel || duel.players.length >= 2 || duel.players.some(p => p.userId === userId)) return false;

        const side = duel.players.length === 0 ? 'A' : 'B';

        duel.players.push({
            userId,
            username,
            side,
            class: null,
            hp: 100,
            maxHp: 100,
            skillState: [],
            statusEffects: []
        });

        return true;
    }

    function isPlayer(channelId, userId) {
        const duel = getDuel(channelId);
        return duel?.players.some(p => p.userId === userId);
    }

    function setClass(channelId, userId, classData) {
        const duel = getDuel(channelId);
        if (!duel || duel.phase !== 'class') return false;

        const player = duel.players.find(p => p.userId === userId);
        if (!player || player.class) return false;

        player.class = classData;
        player.hp = classData.hp;
        player.maxHp = classData.hp;
        player.skillState = classData.skills.map(skill => ({
            name: skill.name,
            description: skill.description,
            uses: skill.uses,
            usesLeft: skill.uses,
            cooldown: 0
        }));

        return true;
    }

    function bothClassesSelected(channelId) {
        const duel = getDuel(channelId);
        return duel?.players.every(p => p.class !== null);
    }

    function startDuel(channelId) {
        const duel = getDuel(channelId);
        if (!duel || duel.players.length < 2) return false;

        duel.phase = 'active';
        duel.turn = duel.players[Math.floor(Math.random() * 2)].userId;
        duel.log.push(`Let the duel begin.`);
        return true;
    }

module.exports = {
    createDuel,
    getDuel,
    endDuel,
    joinDuel,
    isPlayer,
    setClass,
    bothClassesSelected,
    startDuel
}