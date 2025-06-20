module.exports = {
    "Shield Bash": (ctx) => {
        const { damage } = ctx.applyDamage(ctx.player('opponent'), 10);
        ctx.player('opponent').hp -= damage;
        ctx.addStatus(ctx.player('opponent'), {name: 'stun', duration: 1});
        return `${ctx.player().username} bashes ${ctx.player('opponent').username}, dealing ${damage} damage and stunning them!`;
    },
    "Fortify": (ctx) => {
        ctx.addStatus(ctx.player(), { name: 'fortify', duration: 3});
        return `${ctx.player().username} readies their shield, ready to parry blows.`;
    },
    "Backstab": (ctx) => {
        const { damage } = ctx.applyDamage(ctx.player('opponent'), 40);
        ctx.player('opponent').hp -= damage;
        return `${ctx.player().username} rushes ${ctx.player('opponent').username} and backstabs them, dealing ${damage} damage`;
    },
    "Shadowstep": (ctx) => {
        ctx.addStatus(ctx.player(), { name: 'shadow', duration: 1 });
        return `${ctx.player().username} blends with the shadows, turning invisible.`;
    },
    "Flame Burst": (ctx) => {
        const { damage } = ctx.applyDamage(ctx.player('opponent'), 30);
        ctx.player('opponent').hp -= damage;
        ctx.addStatus(ctx.player('opponent'), {name: 'burn', duration: 3});
        return `${ctx.player().username} lets out a gout of flame against ${ctx.player('opponent').username}, dealing ${damage} damage and burning them!`;
    },
    "Combust": (ctx) => {
        const { damage } = ctx.applyDamage(ctx.player('opponent'), 50);
        ctx.player('opponent').hp -= damage;
        const selfDamage = ctx.applyDamage(ctx.player(), 50);
        ctx.player().hp -= selfDamage;
        return `${ctx.player().username} explodes into a hurricane of fire, burning both themselves for ${selfDamage} damage and ${ctx.player('opponent').username} for ${damage} damage`;
    }
}