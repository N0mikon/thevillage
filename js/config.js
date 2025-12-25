// The Village - Game Configuration
// Contains all game configuration, initial state, and data structures

// Initialize village game state
var villageGame = {
    resources: {
        food: { owned: 0, max: 100 },
        wood: { owned: 0, max: 100 },
        metal: { owned: 0, max: 100 }, // We'll use this for stone
        science: { owned: 0, max: -1 }, // We'll use this for knowledge
        gems: { owned: 0, max: -1 }, // We'll use this for gold
        herbs: { owned: 0, max: 50 }, // Herbs
        iron: { owned: 0, max: 100 }, // Iron
        peasants: { owned: 0, max: 10 }
    },
    buildings: {
        Campfire: {
            owned: 0,
            baseCost: { wood: 10 },
            cost: { wood: 10 }, // Current cost (scales with purchases)
            description: "A warm campfire that illuminates the darkness and attracts weary travelers.",
            effect: "Consumes 0.5 wood/sec and attracts 1 peasant every 10 seconds",
            effectValue: 0.5,
            peasantTimer: 0, // Timer for peasant attraction
            unlocked: true // Always available from the start
        },
        WoodenHut: {
            owned: 0,
            baseCost: { wood: 100 }, // Added for cost scaling
            cost: { wood: 100 }, // Current cost (scales with purchases)
            description: "A simple wooden shelter that provides protection from the elements and increases the village's capacity for new residents.",
            effect: "Increases peasant cap by 10",
            effectValue: 10,
            unlocked: false // Will be unlocked when population hits 10
        },
        Granary: {
            owned: 0,
            baseCost: { wood: 50, food: 25 },
            cost: { wood: 50, food: 25 },
            description: "A storage building that preserves food and increases the village's food storage capacity.",
            effect: "Increases food storage capacity by 50",
            effectValue: 50,
            unlocked: false // Will be unlocked when hitting 100 food
        },
        Lumberyard: {
            owned: 0,
            baseCost: { wood: 75 },
            cost: { wood: 75 },
            description: "A specialized building for processing and storing wood, increasing the village's wood storage capacity.",
            effect: "Increases wood storage capacity by 100",
            effectValue: 100,
            unlocked: false // Will be unlocked when hitting 100 wood
        },
        HerbGarden: {
            owned: 0,
            baseCost: { wood: 40, herbs: 10 },
            cost: { wood: 40, herbs: 10 },
            description: "A dedicated garden for cultivating and storing medicinal herbs, increasing the village's herb storage capacity.",
            effect: "Increases herb storage capacity by 75",
            effectValue: 75,
            unlocked: false // Will be unlocked when hitting 50 herbs
        },
        Quarry: {
            owned: 0,
            baseCost: { wood: 150, food: 50 },
            cost: { wood: 150, food: 50 },
            description: "A stone quarry that allows mining operations and increases stone storage capacity.",
            effect: "Increases stone storage by 100 and unlocks Miner job",
            effectValue: 100,
            unlocked: false // Will be unlocked at 40 population
        },
        Workshop: {
            owned: 0,
            baseCost: { wood: 200, metal: 25 },
            cost: { wood: 200, metal: 25 },
            description: "A workshop where craftsmen improve tools and techniques, boosting all production.",
            effect: "Increases all job production by 10%",
            effectValue: 0.10,
            unlocked: false // Will be unlocked at 50 population
        },
        Library: {
            owned: 0,
            baseCost: { wood: 300, metal: 50 },
            cost: { wood: 300, metal: 50 },
            description: "A place of learning where scholars study and accumulate knowledge for the village.",
            effect: "Unlocks Scholar job and stores knowledge",
            effectValue: 100,
            unlocked: false // Will be unlocked at 75 population
        },
        Market: {
            owned: 0,
            baseCost: { wood: 400, food: 100, metal: 50 },
            cost: { wood: 400, food: 100, metal: 50 },
            description: "A bustling marketplace where merchants trade goods and bring gold to the village.",
            effect: "Unlocks Merchant job and enables trading",
            effectValue: 1,
            unlocked: false // Will be unlocked at 100 population
        },
        Temple: {
            owned: 0,
            baseCost: { wood: 500, metal: 100, science: 25 },
            cost: { wood: 500, metal: 100, science: 25 },
            description: "A sacred temple that provides spiritual guidance and boosts village morale.",
            effect: "Increases base morale by 15%",
            effectValue: 15,
            unlocked: false // Will be unlocked at 150 population
        },
        Barracks: {
            owned: 0,
            baseCost: { wood: 250, metal: 75, iron: 25 },
            cost: { wood: 250, metal: 75, iron: 25 },
            description: "A training ground for soldiers to defend the village against monsters.",
            effect: "Unlocks Soldier job and combat",
            effectValue: 10,
            unlocked: false // Will be unlocked when first monster discovered
        }
    },
    jobs: {
        Farmer: {
            owned: 0,
            description: "Grows crops and tends to the fields.",
            effect: "Produces 1 food per second per farmer",
            effectValue: 1,
            resource: "food",
            unlocked: false // Will be unlocked when first peasant arrives
        },
        Woodcutter: {
            owned: 0,
            description: "Chops down trees and gathers wood.",
            effect: "Produces 1 wood per second per woodcutter",
            effectValue: 1,
            resource: "wood",
            unlocked: false // Will be unlocked when first peasant arrives
        },
        Herbalist: {
            owned: 0,
            description: "Gathers medicinal herbs and creates healing remedies.",
            effect: "Produces 1 herb per second per herbalist",
            effectValue: 1,
            resource: "herbs",
            unlocked: false // Will be unlocked at 10th death
        },
        Explorer: {
            owned: 0,
            description: "Explores the surrounding wilderness and discovers new resources.",
            effect: "Explores 0.1 map tile per second per explorer",
            effectValue: 0.1,
            resource: "exploration",
            unlocked: false // Will be unlocked at 30 population
        },
        Miner: {
            owned: 0,
            description: "Extracts stone from the quarry for construction.",
            effect: "Produces 1 stone per second per miner",
            effectValue: 1,
            resource: "metal",
            unlocked: false // Will be unlocked when first Quarry is built
        },
        Scholar: {
            owned: 0,
            description: "Studies ancient texts and accumulates knowledge.",
            effect: "Produces 0.5 knowledge per second per scholar",
            effectValue: 0.5,
            resource: "science",
            unlocked: false // Will be unlocked when first Library is built
        },
        Merchant: {
            owned: 0,
            description: "Trades goods with distant lands and brings gold to the village.",
            effect: "Produces 0.25 gold per second per merchant",
            effectValue: 0.25,
            resource: "gems",
            unlocked: false // Will be unlocked when first Market is built
        },
        Soldier: {
            owned: 0,
            description: "Defends the village and fights monsters in the wilderness.",
            effect: "Provides 10 combat strength per soldier",
            effectValue: 10,
            resource: "combat",
            unlocked: false // Will be unlocked when first Barracks is built
        }
    },
    global: {
        playerGathering: "",
        playerModifier: 1,
        woodConsumption: 0, // Track wood consumption from buildings
        campfireActive: true, // Track if campfire is currently burning
        currentTab: "all", // Track current filter tab
        workTimePercentage: 100, // Work time percentage (100% = full work, 0% = full free time)
        morale: 100, // Morale level (0-100, affects job efficiency)
        deathRate: 0.001, // Death rate: 1/1000th of total peasant count per second
        deathUnlocked: false, // Track if death system has been unlocked (population 20)
        firstDeathTriggered: false, // Track if first death message has been shown
        deathCount: 0, // Track total number of deaths
        herbalistUnlocked: false, // Track if herbalist job has been unlocked
        // Peasant accumulation counters (only affect peasant count when they reach whole integers)
        birthAccumulator: 0, // Accumulates birth rate until it reaches 1.0
        deathAccumulator: 0, // Accumulates death rate until it reaches 1.0
        campfireAccumulator: 0, // Accumulates campfire attraction until it reaches 1.0
        explorationAccumulator: 0, // Accumulates exploration progress until it reaches 1.0
        population10StoryTriggered: false, // Track if population 10 storyline has been shown
        jobsUnlocked: false, // Track if jobs have been unlocked
        granaryUnlocked: false, // Track if granary has been unlocked
        lumberyardUnlocked: false, // Track if lumberyard has been unlocked
        herbGardenUnlocked: false, // Track if herb garden has been unlocked
        moraleSystemUnlocked: false, // Track if morale system has been unlocked (population 30)
        birthRateUnlocked: false, // Track if birth rate display has been unlocked (first child)
        firstChildBorn: false, // Track if first child has been born
        explorerUnlocked: false, // Track if explorer job has been unlocked (population 30)
        expeditionUnlocked: false, // Track if expedition panel has been unlocked
        expeditionPartySize: 0, // Current expedition party size
        maxExpeditionPartySize: 1, // Maximum expedition party size
        expeditionActive: false, // Track if expedition is currently active
        // New building unlock flags
        quarryUnlocked: false, // Track if quarry has been unlocked (40 population)
        workshopUnlocked: false, // Track if workshop has been unlocked (50 population)
        libraryUnlocked: false, // Track if library has been unlocked (75 population)
        marketUnlocked: false, // Track if market has been unlocked (100 population)
        templeUnlocked: false, // Track if temple has been unlocked (150 population)
        barracksUnlocked: false, // Track if barracks has been unlocked (monster discovered)
        monsterDiscovered: false, // Track if first monster has been discovered
        workshopBonus: 0, // Total production bonus from workshops (10% per workshop)
        templeBonus: 0, // Total morale bonus from temples (15% per temple)
        // Combat system
        combatStrength: 0, // Total combat strength from soldiers
        monstersDefeated: 0, // Total monsters defeated
        bossDefeated: false, // Track if boss has been defeated
        combatLog: [] // Recent combat log entries
    },
    settings: {
        speed: 10 // 10 ticks per second
    },
    map: {
        width: 8,
        height: 8,
        tiles: [], // Will be populated with map tiles
        exploredTiles: 0 // Track number of explored tiles
    }
};
