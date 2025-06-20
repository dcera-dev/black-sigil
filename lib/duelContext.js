const { renderFullDuelEmbed } = require('../ui/uiEmbeds');
const { getDuelComponents} = require('../ui/uiComponents');
const classList = require('../data/classes');
const duelManager = require('./duel-manager');

function createDuelContext(channelId) {
    const duel = duelManager.getDuel(channelId);


    const player = (who = 'self') => {
        switch (who) {
            case 'self':
                return duel.players.find(p => p.userId === duel.turn);
            case 'opponent':
                return duel.players.find(p => p.userId !== duel.turn);
            default:
                return duel.players.find(p => p.userId === who); 
        }
    }

    const log = async (message) => {
        duel.log.push(message);
    }

    function applyDamage(targetPlayer, amount) {
        let finalAmount = amount;
        let reflect = false;
        let evade = false;

        const hasStatus = (name) => {
            return targetPlayer.statusEffects.some(s => s.name === name)
        }

        if (hasStatus('guard')) {
            finalAmount = Math.floor(finalAmount / 2);
        }
        else if (hasStatus('evade') && Math.random() < 0.25) {
            finalAmount = 0;
            evade = true;
        }
        else if (hasStatus('flame-shield')) {
            finalAmount = Math.max(0, finalAmount - 10);
            reflect = true;
        }
        else if (hasStatus('fortify')) {
            finalAmount = Math.max(0, finalAmount - 10);
        }
        else if (hasStatus('shadow')) {
            finalAmount = 0;
            evade = true;
        }
        
        return { damage: finalAmount, reflect: reflect, evade: evade };

    }

    function canUseSkill(target, skillIndex) {
        const state = target.skillState[skillIndex]
        if (!state) return false;

        const isOnCooldown = state.cooldown > 0;
        const isOutOfUses = state.usesLeft !== Infinity && state.usesLeft <= 0;

        return !isOnCooldown && !isOutOfUses;
    }

    function useSkill(caster, skillName, classData) {
        const skill = classData.skills.find(s => s.name === skillName);
        const state = caster.skillState.find(s => s.name === skillName);

        if (!skill || !state) return false;

        //Cooldown
        state.cooldown = skill.cooldown;

        //Reduce uses
        if (state.usesLeft !== Infinity) state.usesLeft--;

        return true;
    }

    function getStatus(target, name) {
        return target.statusEffects.find(s => s.name === name);
    }

    function addStatus(target, status) {
        const existing = getStatus(target, status.name);
        if (existing) {
            existing.duration = status.duration;
            if ('value' in status) existing.value = status.value;
        }
        else {
            target.statusEffects.push({...status});
        }
    }

    function tickStatuses() {
        duel.players.forEach(p => {
            const effectsToKeep = [];

            for (s of p.statusEffects) {
                if (s.name === "burn") {
                    const { d } = applyDamage(p, 5).damage;
                    p.hp -= d;
                }
                s.duration--;
                if (s.duration >= 0) {
                    effectsToKeep.push(s);
                }
            }
            p.statusEffects = effectsToKeep;
        })
    }

    function advanceTurn() {
        if (duel.phase !== 'active') return null;

        tickStatuses();

        duel.players.forEach(p => {
            //Skill Cooldowns
            p.skillState.forEach(state => {
                if (state.cooldown > 0) state.cooldown--;
            });
        })

        const isKO = duel.players.find(p => p.hp <= 0);
        if (isKO) {
            duel.phase = 'ended';
            return null;
        }

        //Advance Turn
        const currentIndex = duel.players.findIndex(p => p.userId === duel.turn);
        duel.turn = duel.players[(currentIndex + 1) % duel.players.length].userId;

        const hasStatus = (name) => {
            return player(duel.turn).statusEffects.some(s => s.name === name)
        }

        if (hasStatus('stun')) {
            duel.turn = duel.players[currentIndex].userId;
        }

        return player(duel.turn);
    }

    return {
        duel,
        player,
        log,
        applyDamage,
        addStatus,
        getStatus,
        canUseSkill,
        useSkill,
        advanceTurn
    }
}

module.exports = {
    createDuelContext
}