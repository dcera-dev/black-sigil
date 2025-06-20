module.exports = [
    {
        name: "Knight",
        hp: 150,
        baseDamage: 15,
        basicDefense: {
            name: "Guard",
            description: "Reduce incoming damage by 50% this turn.",
            effect: {
                name: "guard",
                duration: 1
            }
        },
        skills:[
            {
                name: "Shield Bash",
                description: "Stun the opponent and deal 10 damage.",
                uses: 2,
                cooldown: 2
            },
            {
                name: "Fortify",
                description: "Gain +10 defense for 3 turns.",
                uses: Infinity,
                cooldown: 3
            }
        ]
    },
    {
        name: "Assassin",
        hp: 110,
        baseDamage: 25,
        basicDefense: {
            name: "Evade",
            description: "25% chance to avoid all damage this turn.",
            effect: {
                name: "evade",
                duration: 1
            }
        },
        skills: [
            {
                name: "Backstab",
                description: "Deal 40 damage.",
                uses: 1,
                cooldown: 0
            },
            {
                name: "Shadowstep",
                description: "Avoid next attack.",
                uses: 2,
                cooldown: 2
            }
        ]
    },
    {
        name: "Pyromancer",
        hp: 90,
        baseDamage: 20,
        basicDefense: {
            name: "Fire Shield",
            description: "Block 10 damage and reflect 5.",
            effect: {
                name: "flame-shield",
                duration: 1
            }
        },
        skills: [
            {
                name: "Flame Burst",
                description: "Deal 30 damage and burn for 3 turns.",
                uses: 3,
                cooldown: 2
            },
            {
                name: "Combust",
                description: "Explode burning everyone for 50 damage.",
                uses: Infinity,
                cooldown: 3
            }
        ]
    }
];