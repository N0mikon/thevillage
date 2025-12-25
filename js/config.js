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
        combatLog: [], // Recent combat log entries
        // Upgrade system bonuses
        upgradesUnlocked: false, // Track if upgrade panel has been unlocked (Library built)
        upgradeBonus: {
            farmerProduction: 0, // Bonus to farmer production (additive percentage)
            woodcutterProduction: 0, // Bonus to woodcutter production
            herbalistProduction: 0, // Bonus to herbalist production
            minerProduction: 0, // Bonus to miner production
            scholarProduction: 0, // Bonus to scholar production
            merchantProduction: 0, // Bonus to merchant production
            allProduction: 0, // Bonus to all job production
            gatheringSpeed: 0, // Bonus to player gathering speed
            explorationSpeed: 0, // Bonus to exploration speed
            explorationRewards: 0, // Bonus to exploration resource rewards
            combatStrength: 0, // Bonus to soldier combat strength
            deathRateReduction: 0, // Reduction to death rate
            immigrationRate: 0, // Bonus to immigration rate
            buildingCostReduction: 0, // Reduction to building costs
            researchCostReduction: 0 // Reduction to research costs
        }
    },
    settings: {
        speed: 10 // 10 ticks per second
    },
    map: {
        width: 8,
        height: 8,
        tiles: [], // Will be populated with map tiles
        exploredTiles: 0 // Track number of explored tiles
    },
    upgrades: {
        // Tier 1 - Basic Research (requires Library)
        BetterTools: {
            purchased: false,
            cost: { science: 10 },
            description: "Improved farming and woodcutting tools.",
            effect: "Farmers and Woodcutters produce 25% more resources",
            effectValue: 0.25,
            category: "production",
            tier: 1,
            requires: [],
            unlocked: false
        },
        EfficientGathering: {
            purchased: false,
            cost: { science: 15 },
            description: "Techniques for more efficient resource gathering.",
            effect: "Player gathering speed increased by 50%",
            effectValue: 0.5,
            category: "gathering",
            tier: 1,
            requires: [],
            unlocked: false
        },
        BasicMedicine: {
            purchased: false,
            cost: { science: 20 },
            description: "Basic understanding of medicinal herbs.",
            effect: "Herbalists produce 50% more herbs",
            effectValue: 0.5,
            category: "production",
            tier: 1,
            requires: [],
            unlocked: false
        },
        Cartography: {
            purchased: false,
            cost: { science: 25 },
            description: "The art of map-making improves exploration.",
            effect: "Explorers work 50% faster",
            effectValue: 0.5,
            category: "exploration",
            tier: 1,
            requires: [],
            unlocked: false
        },

        // Tier 2 - Advanced Research
        IronTools: {
            purchased: false,
            cost: { science: 50, iron: 20 },
            description: "Tools forged from iron last longer and cut deeper.",
            effect: "All job production increased by 15%",
            effectValue: 0.15,
            category: "production",
            tier: 2,
            requires: ["BetterTools"],
            unlocked: false
        },
        Agriculture: {
            purchased: false,
            cost: { science: 40 },
            description: "Advanced farming techniques for better yields.",
            effect: "Farmers produce 50% more food",
            effectValue: 0.5,
            category: "production",
            tier: 2,
            requires: ["BetterTools"],
            unlocked: false
        },
        Forestry: {
            purchased: false,
            cost: { science: 40 },
            description: "Sustainable logging practices.",
            effect: "Woodcutters produce 50% more wood",
            effectValue: 0.5,
            category: "production",
            tier: 2,
            requires: ["BetterTools"],
            unlocked: false
        },
        Geology: {
            purchased: false,
            cost: { science: 45 },
            description: "Understanding of rock formations and ore veins.",
            effect: "Miners produce 50% more stone",
            effectValue: 0.5,
            category: "production",
            tier: 2,
            requires: ["BetterTools"],
            unlocked: false
        },
        AdvancedMedicine: {
            purchased: false,
            cost: { science: 60 },
            description: "Advanced herbal remedies and treatments.",
            effect: "Death rate reduced by 25%",
            effectValue: 0.25,
            category: "survival",
            tier: 2,
            requires: ["BasicMedicine"],
            unlocked: false
        },
        Navigation: {
            purchased: false,
            cost: { science: 55 },
            description: "Star-based navigation techniques.",
            effect: "Exploration yields 25% more resources",
            effectValue: 0.25,
            category: "exploration",
            tier: 2,
            requires: ["Cartography"],
            unlocked: false
        },

        // Tier 3 - Expert Research
        SteelForging: {
            purchased: false,
            cost: { science: 100, iron: 50 },
            description: "The secrets of forging steel from iron.",
            effect: "All job production increased by 25%",
            effectValue: 0.25,
            category: "production",
            tier: 3,
            requires: ["IronTools"],
            unlocked: false
        },
        CropRotation: {
            purchased: false,
            cost: { science: 80 },
            description: "Rotating crops to maintain soil fertility.",
            effect: "Farmers produce 75% more food",
            effectValue: 0.75,
            category: "production",
            tier: 3,
            requires: ["Agriculture"],
            unlocked: false
        },
        MilitaryTactics: {
            purchased: false,
            cost: { science: 90, iron: 30 },
            description: "Advanced combat strategies and formations.",
            effect: "Soldiers provide 50% more combat strength",
            effectValue: 0.5,
            category: "combat",
            tier: 3,
            requires: ["IronTools"],
            unlocked: false
        },
        TradeRoutes: {
            purchased: false,
            cost: { science: 85, gems: 25 },
            description: "Established trade routes with distant lands.",
            effect: "Merchants produce 100% more gold",
            effectValue: 1.0,
            category: "economy",
            tier: 3,
            requires: ["Navigation"],
            unlocked: false
        },
        Philosophy: {
            purchased: false,
            cost: { science: 100 },
            description: "Deep thinking about the nature of existence.",
            effect: "Scholars produce 50% more knowledge",
            effectValue: 0.5,
            category: "research",
            tier: 3,
            requires: [],
            unlocked: false
        },
        Architecture: {
            purchased: false,
            cost: { science: 120, metal: 50 },
            description: "Advanced building techniques and designs.",
            effect: "Building costs reduced by 15%",
            effectValue: 0.15,
            category: "construction",
            tier: 3,
            requires: ["Geology"],
            unlocked: false
        },

        // Tier 4 - Master Research
        Industrialization: {
            purchased: false,
            cost: { science: 200, iron: 100 },
            description: "The beginning of industrial production.",
            effect: "All job production increased by 50%",
            effectValue: 0.5,
            category: "production",
            tier: 4,
            requires: ["SteelForging"],
            unlocked: false
        },
        Diplomacy: {
            purchased: false,
            cost: { science: 150, gems: 50 },
            description: "The art of negotiation and peaceful relations.",
            effect: "Immigration rate increased by 50%",
            effectValue: 0.5,
            category: "population",
            tier: 4,
            requires: ["TradeRoutes"],
            unlocked: false
        },
        WarMachines: {
            purchased: false,
            cost: { science: 180, iron: 75 },
            description: "Siege equipment and war machines.",
            effect: "Soldiers provide 100% more combat strength",
            effectValue: 1.0,
            category: "combat",
            tier: 4,
            requires: ["MilitaryTactics"],
            unlocked: false
        },
        Enlightenment: {
            purchased: false,
            cost: { science: 250 },
            description: "A new age of reason and understanding.",
            effect: "All research costs reduced by 20%",
            effectValue: 0.2,
            category: "research",
            tier: 4,
            requires: ["Philosophy"],
            unlocked: false
        },
        MasterBuilders: {
            purchased: false,
            cost: { science: 200, metal: 100 },
            description: "The greatest builders in the land.",
            effect: "Building costs reduced by 25%",
            effectValue: 0.25,
            category: "construction",
            tier: 4,
            requires: ["Architecture"],
            unlocked: false
        }
    },
    // Prestige System - Permanent bonuses that persist through resets
    prestige: {
        legacyPoints: 0, // Current unspent legacy points
        totalLegacyPointsEarned: 0, // Total legacy points ever earned
        timesPrestiged: 0, // Number of times the player has prestiged
        dragonsSlain: 0, // Total dragons slain across all runs
        unlocked: false, // Prestige unlocks after first dragon kill
        // Prestige bonuses (permanent, applied immediately each run)
        bonuses: {
            startingResources: 0, // Bonus starting resources (x10 per level)
            productionMultiplier: 0, // Production bonus (5% per level)
            explorationBonus: 0, // Exploration speed bonus (10% per level)
            combatBonus: 0, // Combat strength bonus (15% per level)
            populationCapBonus: 0, // Starting population cap bonus (+5 per level)
            costReduction: 0, // Building/research cost reduction (3% per level)
            immigrationBonus: 0 // Immigration speed bonus (10% per level)
        },
        // Prestige upgrades (purchased with legacy points)
        upgrades: {
            ResourceHeadstart: {
                purchased: 0, // Tracks level (0-10)
                maxLevel: 10,
                cost: 1, // Cost per level
                costScale: 1.5, // Cost multiplier per level
                description: "Start with bonus resources each run.",
                effect: "Start with +10 of each resource per level",
                effectValue: 10,
                category: "starting"
            },
            VeteranWorkers: {
                purchased: 0,
                maxLevel: 20,
                cost: 2,
                costScale: 1.3,
                description: "Your workers remember their skills from past lives.",
                effect: "+5% production per level",
                effectValue: 0.05,
                category: "production"
            },
            ExperiencedExplorers: {
                purchased: 0,
                maxLevel: 10,
                cost: 3,
                costScale: 1.5,
                description: "Explorers know the land better each time.",
                effect: "+10% exploration speed per level",
                effectValue: 0.10,
                category: "exploration"
            },
            BattleHardened: {
                purchased: 0,
                maxLevel: 10,
                cost: 4,
                costScale: 1.5,
                description: "Soldiers trained by veterans of past battles.",
                effect: "+15% combat strength per level",
                effectValue: 0.15,
                category: "combat"
            },
            ExpandedSettlement: {
                purchased: 0,
                maxLevel: 10,
                cost: 3,
                costScale: 1.4,
                description: "Your settlement starts with better infrastructure.",
                effect: "+5 starting population cap per level",
                effectValue: 5,
                category: "population"
            },
            EfficientDesigns: {
                purchased: 0,
                maxLevel: 10,
                cost: 5,
                costScale: 1.6,
                description: "Building designs refined over generations.",
                effect: "-3% building and research costs per level",
                effectValue: 0.03,
                category: "economy"
            },
            FamousVillage: {
                purchased: 0,
                maxLevel: 10,
                cost: 4,
                costScale: 1.5,
                description: "Word of your village spreads across the land.",
                effect: "+10% immigration speed per level",
                effectValue: 0.10,
                category: "population"
            },
            AncientKnowledge: {
                purchased: 0,
                maxLevel: 5,
                cost: 10,
                costScale: 2.0,
                description: "Unlock research upgrades earlier.",
                effect: "Start with first N tier 1 upgrades unlocked per level",
                effectValue: 1,
                category: "research"
            },
            DragonslayerLegacy: {
                purchased: 0,
                maxLevel: 1,
                cost: 50,
                costScale: 1,
                description: "The legend of the Dragonslayer lives on.",
                effect: "Start with +100 of all resources and 20 population cap",
                effectValue: 1,
                category: "special"
            }
        }
    }
};
