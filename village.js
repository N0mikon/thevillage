// The Village - Peasant Management Game
// A village-themed incremental/idle game
// Game configuration is now loaded from js/config.js

// Resource management functions are now in js/resources.js

// Population management functions are now in js/population.js
// Building system functions are now in js/buildings.js

// handlePeasantBirthRate function is now in js/population.js

// Handle peasant death rate
function handlePeasantDeathRate() {
    const totalPeasants = Math.floor(villageGame.resources.peasants.owned);

    // Only process death if population >= 20 and peasants exist
    if (totalPeasants >= 20 && totalPeasants > 0) {
        // Base death rate: 1/1000th of integer peasant count per second
        let deathRate = (totalPeasants * villageGame.global.deathRate) / villageGame.settings.speed;

        // Reduce death rate based on herbs in storage (0.001/sec per herb)
        const herbsReduction = (villageGame.resources.herbs.owned * 0.001) / villageGame.settings.speed;
        deathRate = Math.max(0, deathRate - herbsReduction);

        // Apply upgrade death rate reduction
        const upgradeBonus = villageGame.global.upgradeBonus || {};
        const deathRateReduction = 1 - (upgradeBonus.deathRateReduction || 0);
        deathRate = deathRate * deathRateReduction;
        
        // Add to death accumulator
        villageGame.global.deathAccumulator += deathRate;
        
        // Check if we've accumulated enough for a whole peasant death
        if (villageGame.global.deathAccumulator >= 1.0) {
            // Remove peasant
            villageGame.resources.peasants.owned -= 1;
            
            // Increment death counter
            villageGame.global.deathCount += 1;
            
            // Reset accumulator (keep any remainder)
            villageGame.global.deathAccumulator -= 1.0;
            
            // Don't go below 0
            if (villageGame.resources.peasants.owned < 0) {
                villageGame.resources.peasants.owned = 0;
            }
            
            // First death message and unlock
            if (!villageGame.global.firstDeathTriggered) {
                villageGame.global.firstDeathTriggered = true;
                villageGame.global.deathUnlocked = true;
                
                // Show unlock message
                addMessage("As your village grows larger, the harsh realities of life become apparent. Death has come to your settlement.", "Story");
                addMessage("Death System Unlocked", "Unlock");
                
                // Show death rate display
                const deathRateElement = document.getElementById('deathRate');
                if (deathRateElement) {
                    deathRateElement.style.display = 'block';
                }
                
                // Show first death message
                addMessage("The first death has occurred in your village. This marks a turning point in your settlement's history.", "Death");
            }
            
            // 10th death - unlock herbalist
            if (villageGame.global.deathCount === 10 && !villageGame.global.herbalistUnlocked) {
                villageGame.global.herbalistUnlocked = true;
                villageGame.jobs.Herbalist.unlocked = true;
                
                // Show herbs resource
                showResource('herbs');
                
                // Show herbalist job in UI
                const herbalistElement = document.querySelector('[data-job="Herbalist"]');
                if (herbalistElement) {
                    herbalistElement.style.display = 'block';
                }
                
                addMessage("After witnessing so much death, the villagers begin to seek ways to heal and prevent illness. Someone suggests gathering medicinal herbs from the forest.", "Story");
                addMessage("Herbalist Job Unlocked", "Unlock");
                addMessage("A villager steps forward, claiming knowledge of healing plants. They become the village's first herbalist.", "Villagers");
            }
            
            // Check if there are employed peasants to remove from jobs
            // Count all employed peasants dynamically
            let totalEmployed = 0;
            for (let jobKey in villageGame.jobs) {
                totalEmployed += villageGame.jobs[jobKey].owned || 0;
            }
            totalEmployed += villageGame.global.expeditionPartySize || 0;
            const totalUnemployed = totalPeasants - totalEmployed;

            // Determine if the death affects an employed or unemployed peasant
            let deathAffectsEmployed = false;
            if (totalEmployed > 0 && totalUnemployed > 0) {
                // Both employed and unemployed exist - random chance based on proportions
                const employedChance = totalEmployed / totalPeasants;
                deathAffectsEmployed = Math.random() < employedChance;
            } else if (totalEmployed > 0) {
                // Only employed peasants exist
                deathAffectsEmployed = true;
            }
            // If only unemployed exist, deathAffectsEmployed stays false

            if (deathAffectsEmployed) {
                // Death affects an employed peasant - remove from a job
                // Build available jobs list dynamically
                const availableJobs = [];
                for (let jobKey in villageGame.jobs) {
                    if (villageGame.jobs[jobKey].owned > 0) {
                        availableJobs.push(jobKey);
                    }
                }

                // Randomly select a job to remove from
                const randomJob = availableJobs[Math.floor(Math.random() * availableJobs.length)];
                villageGame.jobs[randomJob].owned--;

                // Add death message for employed peasant
                const deathMessages = [
                    `A ${randomJob} has died from natural causes.`,
                    `A ${randomJob} succumbed to illness.`,
                    `A ${randomJob} was lost in an accident.`,
                    `A ${randomJob} passed away from old age.`,
                    `A ${randomJob} died from exhaustion.`,
                    `A ${randomJob} was killed by wild animals.`,
                    `A ${randomJob} perished in a storm.`,
                    `A ${randomJob} died from food poisoning.`
                ];
                const randomMessage = deathMessages[Math.floor(Math.random() * deathMessages.length)];
                addMessage(randomMessage, "Death");

                // Update job displays
                updateJobDisplays();
            } else {
                // Death affects an unemployed peasant - no job removal needed
                const deathMessages = [
                    `An unemployed peasant has died from natural causes.`,
                    `An unemployed peasant succumbed to illness.`,
                    `An unemployed peasant was lost in an accident.`,
                    `An unemployed peasant passed away from old age.`,
                    `An unemployed peasant died from starvation.`,
                    `An unemployed peasant was killed by wild animals.`,
                    `An unemployed peasant perished in a storm.`,
                    `An unemployed peasant died from exposure.`
                ];
                const randomMessage = deathMessages[Math.floor(Math.random() * deathMessages.length)];
                addMessage(randomMessage, "Death");
            }
            
            // Update peasant display
            updateResourceDisplay('peasants');
            
            // Update morale based on new population
            updateMorale();
        }
    } else {
        // No peasants - reset accumulator
        villageGame.global.deathAccumulator = 0;
    }
}

// Update the display for a specific resource
// updateResourceDisplay function is now in js/resources.js


// Initialize the map with randomly generated resources
function initializeMap() {
    const map = villageGame.map;
    map.tiles = [];

    // Monster names for variety
    const monsterNames = ['Goblin Camp', 'Wolf Pack', 'Bandit Hideout', 'Spider Nest', 'Orc Warband', 'Troll Cave'];

    // Generate tiles
    for (let y = 0; y < map.height; y++) {
        map.tiles[y] = [];
        for (let x = 0; x < map.width; x++) {
            // Place boss in top left corner (0,0)
            if (x === 0 && y === 0) {
                map.tiles[y][x] = {
                    x: x,
                    y: y,
                    type: 'boss',
                    name: 'Dragon Lair',
                    explored: false,
                    defeated: false,
                    strength: 500,
                    resources: { wood: 200, food: 200, metal: 100, science: 50, gems: 100 }
                };
            } else {
                // Tile type probabilities based on distance from start (bottom-right)
                const distanceFromStart = Math.sqrt(Math.pow(map.width - 1 - x, 2) + Math.pow(map.height - 1 - y, 2));
                const maxDistance = Math.sqrt(Math.pow(map.width - 1, 2) + Math.pow(map.height - 1, 2));
                const difficultyScale = distanceFromStart / maxDistance; // 0 at start, 1 at boss

                const random = Math.random();
                let tile;

                if (random < 0.35) {
                    // Forest tile (35%) - gives wood
                    const woodAmount = Math.floor(20 + Math.random() * 40 + difficultyScale * 30);
                    tile = {
                        type: 'trees',
                        name: 'Forest',
                        resources: { wood: woodAmount }
                    };
                } else if (random < 0.50) {
                    // Meadow tile (15%) - gives food
                    const foodAmount = Math.floor(15 + Math.random() * 30 + difficultyScale * 20);
                    tile = {
                        type: 'meadow',
                        name: 'Fertile Meadow',
                        resources: { food: foodAmount }
                    };
                } else if (random < 0.60) {
                    // Stone deposit (10%) - gives stone
                    const stoneAmount = Math.floor(10 + Math.random() * 20 + difficultyScale * 15);
                    tile = {
                        type: 'stone',
                        name: 'Stone Deposit',
                        resources: { metal: stoneAmount }
                    };
                } else if (random < 0.65) {
                    // Iron vein (5%) - gives iron
                    const ironAmount = Math.floor(5 + Math.random() * 15 + difficultyScale * 10);
                    tile = {
                        type: 'iron',
                        name: 'Iron Vein',
                        resources: { iron: ironAmount }
                    };
                } else if (random < 0.70) {
                    // Herb patch (5%) - gives herbs
                    const herbAmount = Math.floor(10 + Math.random() * 20);
                    tile = {
                        type: 'herbs',
                        name: 'Herb Patch',
                        resources: { herbs: herbAmount }
                    };
                } else if (random < 0.90) {
                    // Monster tile (20%) - requires combat
                    const monsterStrength = Math.floor(20 + difficultyScale * 80 + Math.random() * 30);
                    const rewardMultiplier = 1 + difficultyScale;
                    tile = {
                        type: 'monster',
                        name: monsterNames[Math.floor(Math.random() * monsterNames.length)],
                        defeated: false,
                        strength: monsterStrength,
                        resources: {
                            wood: Math.floor(10 * rewardMultiplier),
                            food: Math.floor(15 * rewardMultiplier),
                            gems: Math.floor(5 * rewardMultiplier)
                        }
                    };
                } else {
                    // Empty tile (10%)
                    tile = {
                        type: 'empty',
                        name: 'Empty Land',
                        resources: {}
                    };
                }

                map.tiles[y][x] = {
                    x: x,
                    y: y,
                    ...tile,
                    explored: false
                };
            }
        }
    }

    console.log("Map initialized with", map.width * map.height, "tiles");
}

// Handle exploration by expedition explorers
function handleExploration() {
    // Only explore if expedition is active and has explorers
    if (!villageGame.global.expeditionActive || villageGame.global.expeditionPartySize <= 0) return;

    const expeditionExplorers = villageGame.global.expeditionPartySize;

    // Calculate exploration rate (0.1 tile per second per expedition explorer) with upgrade bonuses and prestige bonus
    const workEfficiency = villageGame.global.workTimePercentage / 100;
    const moraleEfficiency = villageGame.global.morale / 100;
    const upgradeBonus = villageGame.global.upgradeBonus || {};
    const explorationSpeedBonus = 1 + (upgradeBonus.explorationSpeed || 0);
    const prestigeExplorationBonus = 1 + getPrestigeExplorationBonus();
    const explorationRate = (expeditionExplorers * 0.1 * workEfficiency * moraleEfficiency * explorationSpeedBonus * prestigeExplorationBonus) / villageGame.settings.speed;

    // Add to exploration accumulator
    if (!villageGame.global.explorationAccumulator) {
        villageGame.global.explorationAccumulator = 0;
    }
    villageGame.global.explorationAccumulator += explorationRate;

    // Check if we've accumulated enough for a whole tile exploration
    if (villageGame.global.explorationAccumulator >= 1.0) {
        // Find the next unexplored tile (bottom-right to top-left order)
        let nextTile = null;
        for (let y = villageGame.map.height - 1; y >= 0; y--) {
            for (let x = villageGame.map.width - 1; x >= 0; x--) {
                const tile = villageGame.map.tiles[y][x];
                // Skip explored tiles, but allow revisiting undefeated monsters
                if (!tile.explored || (tile.type === 'monster' && !tile.defeated) || (tile.type === 'boss' && !tile.defeated)) {
                    nextTile = tile;
                    break;
                }
            }
            if (nextTile) break;
        }

        if (nextTile) {
            // Handle tile based on type
            handleTileExploration(nextTile);
        }

        // Reset accumulator (keep any remainder)
        villageGame.global.explorationAccumulator -= 1.0;
    }
}

// Handle exploration of a specific tile
function handleTileExploration(tile) {
    const isFirstVisit = !tile.explored;
    tile.explored = true;

    if (isFirstVisit) {
        villageGame.map.exploredTiles++;
    }

    // Handle based on tile type
    if (tile.type === 'monster' || tile.type === 'boss') {
        handleCombat(tile);
    } else {
        // Resource tiles - collect resources
        collectTileResources(tile);
    }

    // Update map display
    updateMapDisplay();
    updateCombatDisplay();
}

// Handle combat with monsters
function handleCombat(tile) {
    // First monster discovery triggers Barracks unlock
    if (!villageGame.global.monsterDiscovered) {
        villageGame.global.monsterDiscovered = true;
        villageGame.global.barracksUnlocked = true;
        villageGame.buildings.Barracks.unlocked = true;

        addMessage("Your explorers have discovered monsters in the wilderness! The village must prepare defenses.", "Story");
        addMessage("Barracks Unlocked", "Unlock");

        const barracksElement = document.querySelector('[data-building="Barracks"]');
        if (barracksElement) {
            barracksElement.style.display = 'block';
        }
    }

    // Already defeated?
    if (tile.defeated) {
        addMessage(`The ${tile.name} has already been cleared.`, "Loot");
        return;
    }

    // Calculate combat strength with upgrade bonuses and prestige bonus
    const soldierCount = villageGame.jobs.Soldier ? villageGame.jobs.Soldier.owned : 0;
    const soldierStrength = soldierCount * 10; // 10 combat strength per soldier
    const upgradeBonus = villageGame.global.upgradeBonus || {};
    const combatStrengthBonus = 1 + (upgradeBonus.combatStrength || 0);
    const prestigeCombatBonus = 1 + getPrestigeCombatBonus();
    const combatStrength = Math.floor(soldierStrength * combatStrengthBonus * prestigeCombatBonus);
    villageGame.global.combatStrength = combatStrength;

    // Combat resolution
    if (combatStrength >= tile.strength) {
        // Victory!
        tile.defeated = true;
        villageGame.global.monstersDefeated++;

        if (tile.type === 'boss') {
            villageGame.global.bossDefeated = true;
            addMessage(`VICTORY! Your soldiers have slain the Dragon! The village is safe at last!`, "Combat");
            addMessage(`Your ${soldierCount} soldiers (${combatStrength} strength) defeated the Dragon (${tile.strength} strength)!`, "Combat");
            // Unlock prestige system
            unlockPrestige();
        } else {
            addMessage(`Victory! Your soldiers defeated the ${tile.name}!`, "Combat");
            addMessage(`Combat: ${soldierCount} soldiers (${combatStrength} strength) vs ${tile.name} (${tile.strength} strength)`, "Combat");
        }

        // Collect rewards
        collectTileResources(tile);
    } else {
        // Defeat - explorers retreat
        if (tile.type === 'boss') {
            addMessage(`Your soldiers are not strong enough to face the Dragon! Need ${tile.strength} strength, have ${combatStrength}.`, "Combat");
        } else {
            addMessage(`Your soldiers retreated from ${tile.name}! Need ${tile.strength} strength, have ${combatStrength}.`, "Combat");
        }

        // Lose some explorers in failed combat (1 explorer lost per failed attempt)
        if (villageGame.global.expeditionPartySize > 0) {
            villageGame.global.expeditionPartySize--;
            villageGame.resources.peasants.owned--;
            addMessage("An explorer was lost in the retreat!", "Death");
            updateExpeditionDisplays();
            updatePeoplePanelDisplays();
        }
    }
}

// Collect resources from a tile
function collectTileResources(tile) {
    if (!tile.resources || typeof tile.resources !== 'object') return;

    // Apply exploration rewards bonus
    const upgradeBonus = villageGame.global.upgradeBonus || {};
    const explorationRewardsBonus = 1 + (upgradeBonus.explorationRewards || 0);

    let resourcesGained = [];

    for (let resource in tile.resources) {
        const baseAmount = tile.resources[resource];
        const amount = Math.floor(baseAmount * explorationRewardsBonus);
        if (amount > 0 && villageGame.resources[resource]) {
            villageGame.resources[resource].owned += amount;

            // Check max limits
            if (villageGame.resources[resource].max > 0 &&
                villageGame.resources[resource].owned > villageGame.resources[resource].max) {
                villageGame.resources[resource].owned = villageGame.resources[resource].max;
            }

            // Show resource if hidden
            showResource(resource);
            updateResourceDisplay(resource);

            // Format resource name for display
            const resourceNames = {
                wood: 'Wood', food: 'Food', metal: 'Stone', science: 'Knowledge',
                gems: 'Gold', herbs: 'Herbs', iron: 'Iron'
            };
            resourcesGained.push(`${amount} ${resourceNames[resource] || resource}`);
        }
    }

    if (resourcesGained.length > 0) {
        addMessage(`Explorers found ${tile.name}: ${resourcesGained.join(', ')}!`, "Loot");
    } else if (tile.type === 'empty') {
        addMessage(`Explorers explored ${tile.name} but found nothing of value.`, "Loot");
    }
}

// Update combat display panel
function updateCombatDisplay() {
    const combatStatsElement = document.getElementById('combatStats');
    if (combatStatsElement) {
        const soldierCount = villageGame.jobs.Soldier ? villageGame.jobs.Soldier.owned : 0;
        const upgradeBonus = villageGame.global.upgradeBonus || {};
        const combatStrengthBonus = 1 + (upgradeBonus.combatStrength || 0);
        const prestigeCombatBonus = 1 + getPrestigeCombatBonus();
        const combatStrength = Math.floor(soldierCount * 10 * combatStrengthBonus * prestigeCombatBonus);
        combatStatsElement.innerHTML = `
            <div>Soldiers: ${soldierCount}</div>
            <div>Combat Strength: ${combatStrength}</div>
            <div>Monsters Defeated: ${villageGame.global.monstersDefeated || 0}</div>
        `;
    }
}

// Update map display
function updateMapDisplay() {
    const mapPanel = document.querySelector('.map-panel');
    if (!mapPanel) return;

    const map = villageGame.map;
    let mapHTML = '<div class="map-grid">';

    // Tile type icons
    const tileIcons = {
        trees: '🌲',
        meadow: '🌾',
        stone: '⛏️',
        iron: '🔩',
        herbs: '🌿',
        monster: '👹',
        boss: '🐉',
        empty: '🏜️'
    };

    for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {
            const tile = map.tiles[y][x];
            let tileClass = 'map-tile';
            let tileContent = '';

            if (!tile.explored) {
                tileClass += ' unexplored';
                tileContent = '<div class="tile-icon">❓</div>';
            } else {
                // Apply different styles based on tile type
                if (tile.type === 'monster') {
                    tileClass += tile.defeated ? ' explored tile-monster-defeated' : ' tile-monster';
                } else if (tile.type === 'boss') {
                    tileClass += tile.defeated ? ' explored tile-boss-defeated' : ' tile-boss';
                } else {
                    tileClass += ' explored tile-' + tile.type;
                }

                const icon = tileIcons[tile.type] || '❓';
                tileContent = `<div class="tile-icon">${icon}</div>`;

                // Show strength for monsters/boss if not defeated
                if ((tile.type === 'monster' || tile.type === 'boss') && !tile.defeated) {
                    tileContent += `<div class="tile-strength">⚔️${tile.strength}</div>`;
                }
            }

            mapHTML += `<div class="${tileClass}" data-x="${x}" data-y="${y}" title="${tile.explored ? tile.name : 'Unexplored'}">${tileContent}</div>`;
        }
    }

    mapHTML += '</div>';

    // Combat stats panel with upgrade bonus and prestige bonus
    const soldierCount = villageGame.jobs.Soldier ? villageGame.jobs.Soldier.owned : 0;
    const upgradeBonus = villageGame.global.upgradeBonus || {};
    const combatStrengthBonus = 1 + (upgradeBonus.combatStrength || 0);
    const prestigeCombatBonus = 1 + getPrestigeCombatBonus();
    const combatStrength = Math.floor(soldierCount * 10 * combatStrengthBonus * prestigeCombatBonus);
    mapHTML += `<div class="map-stats">
        <div>Explored: ${map.exploredTiles}/${map.width * map.height} tiles | Monsters Defeated: ${villageGame.global.monstersDefeated || 0}</div>
        <div>Combat Strength: ⚔️${combatStrength} (${soldierCount} soldiers)</div>
    </div>`;

    mapPanel.innerHTML = mapHTML;
}

// Initialize the village game
function initVillageGame() {
    console.log("Initializing Village Game...");
    
    // Initialize our village game state
    console.log("Village game state initialized");
    
    // Initialize the map
    initializeMap();
    
    // Start the game loop
    setInterval(() => {
        gatherResources();
    }, 1000 / villageGame.settings.speed);
    
    // Initial display update
    updateAllDisplays();
    
    // Initialize tabs
    filterTabs('all');
    
    // Initialize work time slider
    const workTimeSlider = document.getElementById('workTimeSlider');
    if (workTimeSlider) {
        workTimeSlider.value = villageGame.global.workTimePercentage;
    }
    const workTimeValue = document.getElementById('workTimeValue');
    if (workTimeValue) {
        workTimeValue.textContent = villageGame.global.workTimePercentage;
    }
    
    // Initialize morale display
    updateMorale();
    
    console.log("Village Game initialized!");
}

// Update all displays
function updateAllDisplays() {
    for (let resource in villageGame.resources) {
        updateResourceDisplay(resource);
    }
    updateBuildingDisplays();
    updateJobDisplays();
    updateResourcePerSecondDisplays();
    updatePeoplePanelDisplays();
    updateMapDisplay();
    updateMorale();
    updateExpeditionDisplays();
}

// Purchase a building
function buyBuilding(buildingName) {
    const building = villageGame.buildings[buildingName];
    if (!building) return false;

    // Check if building is unlocked
    if (building.unlocked === false) {
        addMessage(`${buildingName} is not yet available!`, "Loot");
        return false;
    }

    // Check if we've reached the maximum (10)
    if (building.owned >= 10) {
        addMessage(`${buildingName} has reached the maximum limit of 10!`, "Loot");
        return false;
    }

    // Calculate building cost reduction from upgrades and prestige
    const upgradeBonus = villageGame.global.upgradeBonus || {};
    const upgradeCostReduction = 1 - (upgradeBonus.buildingCostReduction || 0);
    const prestigeCostReduction = 1 - getPrestigeCostReduction();
    const totalCostReduction = upgradeCostReduction * prestigeCostReduction;

    // Check if we have enough resources (with cost reduction applied)
    for (let resource in building.cost) {
        const actualCost = Math.ceil(building.cost[resource] * totalCostReduction);
        if (villageGame.resources[resource].owned < actualCost) {
            addMessage(`Not enough ${resource}! Need ${actualCost}, have ${Math.floor(villageGame.resources[resource].owned)}.`, "Loot");
            return false;
        }
    }

    // Deduct resources (with cost reduction applied)
    for (let resource in building.cost) {
        const actualCost = Math.ceil(building.cost[resource] * totalCostReduction);
        villageGame.resources[resource].owned -= actualCost;
    }
    
    // Add building
    building.owned++;
    
    // Scale building cost by 1.1x for next purchase
    for (let resource in building.cost) {
        building.cost[resource] = Math.round(building.cost[resource] * 1.1);
    }
    
    // Apply building effects
    if (buildingName === 'Campfire') {
        villageGame.global.woodConsumption += building.effectValue;
        
        // First time story
        if (building.owned === 1) {
            addMessage("The warm glow of the campfire illuminates the surrounding forest, driving back the shadows and revealing the path ahead. You feel safer now.", "Story");
            
            // Update city type to Campsite
            updateCityType("Campsite");
        }
    } else if (buildingName === 'WoodenHut') {
        // Increase peasant cap by 10
        villageGame.resources.peasants.max += building.effectValue;
        
        // First time story
        if (building.owned === 1) {
            addMessage("The first wooden hut rises from the ground, providing much-needed shelter for your growing village. The peasants cheer as they move in, grateful for a roof over their heads.", "Villagers");
        }
    } else if (buildingName === 'Granary') {
        // Increase food storage capacity by 50
        villageGame.resources.food.max += building.effectValue;
        
        // First time story
        if (building.owned === 1) {
            addMessage("The granary stands tall, its sturdy walls protecting your precious food stores from spoilage and pests. Your villagers can now preserve their harvests for the long winter ahead.", "Construction");
        }
    } else if (buildingName === 'Lumberyard') {
        // Increase wood storage capacity by 100
        villageGame.resources.wood.max += building.effectValue;
        
        // First time story
        if (building.owned === 1) {
            addMessage("The lumberyard provides a dedicated space for processing and storing wood. Your woodworkers can now organize their materials and work more efficiently.", "Construction");
        }
    } else if (buildingName === 'HerbGarden') {
        // Increase herb storage capacity by 75
        villageGame.resources.herbs.max += building.effectValue;

        // First time story
        if (building.owned === 1) {
            addMessage("The herb garden provides a dedicated space for cultivating and storing medicinal herbs. Your herbalists can now grow and preserve their healing plants more effectively.", "Construction");
        }
    } else if (buildingName === 'Quarry') {
        // Increase stone storage capacity by 100
        villageGame.resources.metal.max += building.effectValue;

        // Unlock Miner job
        if (!villageGame.jobs.Miner.unlocked) {
            villageGame.jobs.Miner.unlocked = true;
            showResource('metal');

            const minerElement = document.querySelector('[data-job="Miner"]');
            if (minerElement) {
                minerElement.style.display = 'block';
            }

            addMessage("Miner Job Unlocked", "Unlock");
        }

        // First time story
        if (building.owned === 1) {
            addMessage("The quarry opens access to rich stone deposits beneath the earth. Your miners can now extract valuable building materials.", "Construction");
        }
    } else if (buildingName === 'Workshop') {
        // Increase all job production by 10%
        villageGame.global.workshopBonus = (villageGame.global.workshopBonus || 0) + building.effectValue;

        // First time story
        if (building.owned === 1) {
            addMessage("The workshop hums with activity as craftsmen improve tools and techniques. All workers become more efficient.", "Construction");
        }
    } else if (buildingName === 'Library') {
        // Unlock Scholar job
        if (!villageGame.jobs.Scholar.unlocked) {
            villageGame.jobs.Scholar.unlocked = true;
            showResource('science');

            const scholarElement = document.querySelector('[data-job="Scholar"]');
            if (scholarElement) {
                scholarElement.style.display = 'block';
            }

            addMessage("Scholar Job Unlocked", "Unlock");
        }

        // Unlock upgrades panel on first Library
        if (!villageGame.global.upgradesUnlocked) {
            villageGame.global.upgradesUnlocked = true;

            const upgradesPanel = document.getElementById('upgradesPanel');
            if (upgradesPanel) {
                upgradesPanel.style.display = 'block';
            }

            // Initialize tier 1 upgrades
            initializeUpgrades();

            addMessage("Research Unlocked", "Unlock");
            addMessage("With the library built, your scholars can now research new technologies and improvements.", "Story");
        }

        // First time story
        if (building.owned === 1) {
            addMessage("The library stands as a beacon of knowledge. Scholars gather to study ancient texts and uncover the secrets of the world.", "Construction");
        }
    } else if (buildingName === 'Market') {
        // Unlock Merchant job
        if (!villageGame.jobs.Merchant.unlocked) {
            villageGame.jobs.Merchant.unlocked = true;
            showResource('gems');

            const merchantElement = document.querySelector('[data-job="Merchant"]');
            if (merchantElement) {
                merchantElement.style.display = 'block';
            }

            addMessage("Merchant Job Unlocked", "Unlock");
        }

        // First time story
        if (building.owned === 1) {
            addMessage("The market bustles with traders from distant lands. Gold begins to flow into your village coffers.", "Construction");
        }
    } else if (buildingName === 'Temple') {
        // Increase base morale by 15%
        villageGame.global.templeBonus = (villageGame.global.templeBonus || 0) + building.effectValue;
        updateMorale();

        // First time story
        if (building.owned === 1) {
            addMessage("The temple rises majestically, its spires reaching toward the heavens. The villagers find peace and purpose within its sacred walls.", "Construction");
        }
    } else if (buildingName === 'Barracks') {
        // Unlock Soldier job
        if (!villageGame.jobs.Soldier.unlocked) {
            villageGame.jobs.Soldier.unlocked = true;
            showResource('iron');

            const soldierElement = document.querySelector('[data-job="Soldier"]');
            if (soldierElement) {
                soldierElement.style.display = 'block';
            }

            addMessage("Soldier Job Unlocked", "Unlock");
        }

        // First time story
        if (building.owned === 1) {
            addMessage("The barracks stands ready for training. Your soldiers will defend the village against any threat that emerges from the wilderness.", "Construction");
        }
    }

    // Update displays
    updateAllDisplays();
    updateResourcePerSecondDisplays();
    addMessage(`Built ${buildingName}! ${building.description}`, "Construction");
    
    return true;
}

// Assign a peasant to a job
function assignJob(jobName) {
    if (villageGame.resources.peasants.owned <= 0) {
        addMessage("You need peasants to assign to jobs!", "Loot");
        return false;
    }

    const job = villageGame.jobs[jobName];
    if (!job) return false;

    // Check if job is unlocked
    if (!job.unlocked) {
        addMessage(`${jobName} is not yet available!`, "Loot");
        return false;
    }

    // Check if we have unemployed peasants available
    // Count all employed peasants across ALL job types dynamically
    let totalEmployed = 0;
    for (let jobKey in villageGame.jobs) {
        totalEmployed += villageGame.jobs[jobKey].owned || 0;
    }
    // Also count expedition party members
    totalEmployed += villageGame.global.expeditionPartySize || 0;

    const totalPeasants = Math.floor(villageGame.resources.peasants.owned);
    const unemployed = totalPeasants - totalEmployed;

    if (unemployed <= 0) {
        addMessage("No unemployed peasants available to assign!", "Loot");
        return false;
    }

    // Assign peasant to job (don't change total peasant count)
    job.owned += 1;

    // Update displays
    updateJobDisplays();
    updateResourcePerSecondDisplays();

    // First hire story messages
    if (job.owned === 1) {
        if (jobName === 'Farmer') {
            addMessage("The first farmer begins tending to the fields, ensuring your village will have a steady supply of food.", "Villagers");
        } else if (jobName === 'Woodcutter') {
            addMessage("The first woodcutter starts chopping trees, providing the wood needed for construction and fuel.", "Villagers");
        } else if (jobName === 'Miner') {
            addMessage("The first miner begins extracting stone from the nearby quarry, gathering materials for building.", "Villagers");
        } else if (jobName === 'Scholar') {
            addMessage("The first scholar starts studying ancient texts, accumulating knowledge for the village.", "Villagers");
        } else if (jobName === 'Merchant') {
            addMessage("The first merchant begins trading with nearby settlements, bringing gold to the village.", "Villagers");
        } else if (jobName === 'Herbalist') {
            addMessage("The first herbalist begins gathering medicinal herbs and creating healing remedies for the village.", "Villagers");
        } else if (jobName === 'Explorer') {
            addMessage("The first explorer sets out into the unknown wilderness, eager to discover what lies beyond the familiar forest.", "Villagers");
        } else if (jobName === 'Soldier') {
            addMessage("The first soldier takes up arms, ready to defend the village against any threat.", "Villagers");
        }
    }

    return true;
}

// Remove a peasant from a job
function removeJob(jobName) {
    const job = villageGame.jobs[jobName];
    if (!job || job.owned <= 0) return false;
    
    // Remove peasant from job (don't change total peasant count)
    job.owned -= 1;
    
    // Update displays
    updateJobDisplays();
    updateResourcePerSecondDisplays();
    
    // Job removal message removed for cleaner log
    return true;
}

// Add a message to the log
function addMessage(text, type) {
    const logElement = document.getElementById('log');
    if (!logElement) return;
    
    // Map message types to categories and icons
    let messageClass, icon, dataType;
    
    switch(type) {
        case 'Story':
            messageClass = 'StoryMessage';
            icon = '📖';
            dataType = 'story';
            break;
        case 'Construction':
            messageClass = 'ConstructionMessage';
            icon = '🏗️';
            dataType = 'construction';
            break;
        case 'Loot':
            messageClass = 'LootMessage';
            icon = '🎁';
            dataType = 'loot';
            break;
        case 'Villagers':
            messageClass = 'VillagersMessage';
            icon = '👤';
            dataType = 'villagers';
            break;
        case 'Combat':
            messageClass = 'CombatMessage';
            icon = '⚔️';
            dataType = 'combat';
            break;
        case 'Research':
            messageClass = 'ResearchMessage';
            icon = '📚';
            dataType = 'unlocks';
            break;
        case 'Unlock':
            messageClass = 'StoryMessage';
            icon = '🔓';
            dataType = 'unlocks';
            break;
        case 'Death':
            messageClass = 'DeathMessage';
            icon = '💀';
            dataType = 'villagers';
            break;
        default:
            messageClass = 'LootMessage';
            icon = '📝';
            dataType = 'resources';
    }
    
    const messageElement = document.createElement('div');
    messageElement.className = `${messageClass} log-message`;
    messageElement.setAttribute('data-type', dataType);
    messageElement.innerHTML = `<span style="margin-right: 5px;">${icon}</span>${text}`;
    
    // Check current filter state and only show if it matches
    const activeFilters = document.querySelectorAll('.log-toggle.active:not([data-filter="all"])');
    const activeFilterTypes = Array.from(activeFilters).map(tab => tab.getAttribute('data-filter'));
    
    if (activeFilterTypes.length === 0 || activeFilterTypes.includes(dataType)) {
        messageElement.style.display = 'block';
    } else {
        messageElement.style.display = 'none';
    }
    
    logElement.appendChild(messageElement);
    logElement.scrollTop = logElement.scrollHeight;
}

// Update building displays
function updateBuildingDisplays() {
    // Calculate building cost reduction from upgrades and prestige
    const upgradeBonus = villageGame.global.upgradeBonus || {};
    const upgradeCostReduction = 1 - (upgradeBonus.buildingCostReduction || 0);
    const prestigeCostReduction = 1 - getPrestigeCostReduction();
    const totalCostReduction = upgradeCostReduction * prestigeCostReduction;

    // Helper function to format cost string with reduction applied
    function formatCost(cost) {
        const parts = [];
        const resourceNames = { wood: 'Wood', food: 'Food', metal: 'Stone', science: 'Knowledge', gems: 'Gold', herbs: 'Herbs', iron: 'Iron' };
        for (let res in cost) {
            const actualCost = Math.ceil(cost[res] * totalCostReduction);
            parts.push(`${actualCost} ${resourceNames[res] || res}`);
        }
        return parts.join(', ');
    }

    // Update all buildings dynamically
    for (let buildingName in villageGame.buildings) {
        const building = villageGame.buildings[buildingName];
        const buildingElement = document.querySelector(`[data-building="${buildingName}"]`);

        if (buildingElement) {
            // Update owned count
            const ownedElement = buildingElement.querySelector('.building-owned');
            if (ownedElement) {
                ownedElement.textContent = `Owned: ${building.owned}`;
            }

            // Update cost
            const costElement = buildingElement.querySelector('.building-cost');
            if (costElement) {
                costElement.textContent = `Cost: ${formatCost(building.cost)}`;
            }

            // Show/hide based on unlock status (Campfire is always visible)
            if (buildingName !== 'Campfire') {
                buildingElement.style.display = building.unlocked ? 'block' : 'none';
            }
        }
    }
}

// Update job displays
function updateJobDisplays() {
    // Update all jobs dynamically
    for (let jobName in villageGame.jobs) {
        const job = villageGame.jobs[jobName];
        const jobElement = document.querySelector(`[data-job="${jobName}"]`);

        if (jobElement) {
            // Update assigned count
            const ownedElement = jobElement.querySelector('.building-owned');
            if (ownedElement) {
                ownedElement.textContent = `Assigned: ${job.owned}`;
            }

            // Show/hide based on unlock status
            jobElement.style.display = job.unlocked ? 'block' : 'none';
        }
    }

    // Update building filter to reflect current unlock status
    if (typeof window.filterBuildingItems === 'function') {
        // Get current active tab
        const activeTab = document.querySelector('.building-tab.active');
        const currentFilter = activeTab ? activeTab.getAttribute('data-filter') : 'all';
        window.filterBuildingItems(currentFilter);
    }

    // Resource per second displays are updated by updateAllDisplays()
}

// updateResourcePerSecondDisplays function is now in js/resources.js

// Update people panel displays
function updatePeoplePanelDisplays() {
    // Update population count and cap
    const peopleCountElement = document.querySelector('.people-count');
    if (peopleCountElement) {
        peopleCountElement.textContent = Math.floor(villageGame.resources.peasants.owned);
    }
    
    const peopleCapElement = document.querySelector('.people-cap');
    if (peopleCapElement) {
        peopleCapElement.textContent = villageGame.resources.peasants.max;
    }
    
    // Update population progress bar
    const peopleProgressBar = document.querySelector('.people-progress-fill');
    if (peopleProgressBar) {
        const percentage = (villageGame.resources.peasants.owned / villageGame.resources.peasants.max) * 100;
        peopleProgressBar.style.width = percentage + "%";
    }
    
    // Update immigration rate display (campfire attraction)
    const immigrationRateElements = document.querySelectorAll('.people-rate-value');
    if (immigrationRateElements.length >= 1) {
        let immigrationRate = 0;

        // Calculate immigration rate from campfires
        if (villageGame.buildings.Campfire.owned > 0 && villageGame.global.campfireActive) {
            // Check if we're at the peasant cap
            if (villageGame.resources.peasants.owned < villageGame.resources.peasants.max) {
                // Immigration rate: 0.1 per second per campfire (1 peasant every 10 seconds)
                // Note: Food check happens when actually adding peasant, not in rate calculation
                const upgradeBonus = villageGame.global.upgradeBonus || {};
                const immigrationBonus = 1 + (upgradeBonus.immigrationRate || 0);
                immigrationRate = 0.1 * villageGame.buildings.Campfire.owned * immigrationBonus;
            }
        }

        immigrationRateElements[0].textContent = `+${immigrationRate.toFixed(3)}/sec`;
        immigrationRateElements[0].className = 'people-rate-value positive';
    }
    
    // Update birth rate display (only if unlocked)
    if (immigrationRateElements.length >= 2 && villageGame.global.birthRateUnlocked) {
        const totalPeasants = Math.floor(villageGame.resources.peasants.owned);
        let birthRate = 0;
        
        // Calculate birth rate (only if unemployed and below cap)
        if (totalPeasants > 0) {
            const totalEmployed = villageGame.jobs.Farmer.owned + villageGame.jobs.Woodcutter.owned + villageGame.jobs.Herbalist.owned + villageGame.jobs.Explorer.owned;
            const unemployed = totalPeasants - totalEmployed;
            
            if (unemployed > 0 && totalPeasants < villageGame.resources.peasants.max) {
                // Calculate free time percentage (100 - work time)
                const freeTimePercentage = 100 - villageGame.global.workTimePercentage;
                const freeTimeEfficiency = freeTimePercentage / 100;
                
                // Birth rate: 0.1 per second at 100% free time, scaled by free time efficiency
                birthRate = 0.1 * freeTimeEfficiency;
            }
        }
        
        immigrationRateElements[1].textContent = `+${birthRate.toFixed(3)}/sec`;
        immigrationRateElements[1].className = 'people-rate-value positive';
    }
    
    // Update death rate display (only if unlocked after first death)
    if (immigrationRateElements.length >= 3 && villageGame.global.deathUnlocked) {
        const totalPeasants = Math.floor(villageGame.resources.peasants.owned);

        // Base death rate: 1/1000th of integer peasant count per second
        let deathRate = totalPeasants * villageGame.global.deathRate;

        // Reduce death rate based on herbs in storage (0.001/sec per herb)
        const herbsReduction = villageGame.resources.herbs.owned * 0.001;
        deathRate = Math.max(0, deathRate - herbsReduction);

        // Apply upgrade death rate reduction
        const upgradeBonus = villageGame.global.upgradeBonus || {};
        const deathRateReduction = 1 - (upgradeBonus.deathRateReduction || 0);
        deathRate = deathRate * deathRateReduction;

        immigrationRateElements[2].textContent = `-${deathRate.toFixed(3)}/sec`;
        immigrationRateElements[2].className = 'people-rate-value negative';
    }
}

// Function to show hidden resources
// showResource function is now in js/resources.js

// Function to show hidden rate displays
function showRateDisplay(rateName) {
    const rateElement = document.getElementById(rateName + 'Rate');
    if (rateElement) {
        rateElement.style.display = 'block';
    }
}

// Function to show work time slider
function showWorkTimeSlider() {
    const workTimeContainer = document.getElementById('workTimeContainer');
    if (workTimeContainer) {
        workTimeContainer.style.display = 'block';
    }
    
    // Also show morale display
    const moraleContainer = document.getElementById('moraleContainer');
    if (moraleContainer) {
        moraleContainer.style.display = 'block';
    }
}

// Assign explorer to expedition
function assignExplorerToExpedition() {
    if (villageGame.global.expeditionPartySize >= villageGame.global.maxExpeditionPartySize) {
        addMessage("Expedition party is at maximum size!", "Loot");
        return false;
    }
    
    if (villageGame.jobs.Explorer.owned <= 0) {
        addMessage("No explorers available to assign to expedition!", "Loot");
        return false;
    }
    
    // Remove explorer from regular job
    villageGame.jobs.Explorer.owned -= 1;
    villageGame.global.expeditionPartySize += 1;
    
    // Update displays
    updateExpeditionDisplays();
    updateJobDisplays();
    updateResourcePerSecondDisplays();
    
    addMessage("Explorer assigned to expedition team!", "Villagers");
    return true;
}

// Remove explorer from expedition
function removeExplorerFromExpedition() {
    if (villageGame.global.expeditionPartySize <= 0) {
        addMessage("No explorers in expedition party to remove!", "Loot");
        return false;
    }
    
    // Add explorer back to regular job
    villageGame.jobs.Explorer.owned += 1;
    villageGame.global.expeditionPartySize -= 1;
    
    // Update displays
    updateExpeditionDisplays();
    updateJobDisplays();
    updateResourcePerSecondDisplays();
    
    addMessage("Explorer removed from expedition team!", "Villagers");
    return true;
}

// Launch expedition
function launchExpedition() {
    if (villageGame.global.expeditionPartySize <= 0) {
        addMessage("You need at least one explorer in the expedition party to launch!", "Loot");
        return false;
    }
    
    if (villageGame.global.expeditionActive) {
        addMessage("Expedition is already active!", "Loot");
        return false;
    }
    
    villageGame.global.expeditionActive = true;
    
    // Update launch button
    const launchButton = document.getElementById('launchExpeditionButton');
    if (launchButton) {
        launchButton.textContent = 'Expedition Active';
        launchButton.disabled = true;
    }
    
    addMessage("Expedition launched! Your explorers are now exploring the surrounding lands.", "Villagers");
    return true;
}

// Update expedition displays
function updateExpeditionDisplays() {
    // Update party size display
    const partySizeElement = document.getElementById('expeditionPartySize');
    if (partySizeElement) {
        partySizeElement.textContent = villageGame.global.expeditionPartySize;
    }
    
    // Update explorer count display
    const explorerCountElement = document.getElementById('expeditionExplorerCount');
    if (explorerCountElement) {
        explorerCountElement.textContent = villageGame.global.expeditionPartySize;
    }
    
    // Update launch button state
    const launchButton = document.getElementById('launchExpeditionButton');
    if (launchButton) {
        if (villageGame.global.expeditionActive) {
            launchButton.textContent = 'Expedition Active';
            launchButton.disabled = true;
        } else {
            launchButton.textContent = 'Launch Expedition';
            launchButton.disabled = villageGame.global.expeditionPartySize <= 0;
        }
    }
}

// Make functions globally available
window.setGather = setGather;
window.buyBuilding = buyBuilding;
window.showResource = showResource;
window.showRateDisplay = showRateDisplay;
window.showWorkTimeSlider = showWorkTimeSlider;
window.assignExplorerToExpedition = assignExplorerToExpedition;
window.removeExplorerFromExpedition = removeExplorerFromExpedition;
window.launchExpedition = launchExpedition;

// Filter tabs function
function filterTabs(tabName) {
    // Update tab selection
    const tabs = ['allTab', 'buildingsTab', 'jobsTab', 'upgradesTab'];
    tabs.forEach(tab => {
        const tabElement = document.getElementById(tab);
        if (tabElement) {
            if (tab === tabName + 'Tab') {
                tabElement.className = 'tabSelected buyTab';
            } else {
                tabElement.className = 'tabNotSelected buyTab';
            }
        }
    });
    
    // Show/hide containers based on selected tab
    const buildingsContainer = document.getElementById('buildingsContainer');
    const jobsContainer = document.getElementById('jobsContainer');
    const upgradesContainer = document.getElementById('upgradesContainer');
    
    if (tabName === 'all') {
        if (buildingsContainer) buildingsContainer.style.display = 'block';
        if (jobsContainer) jobsContainer.style.display = 'block';
        if (upgradesContainer) upgradesContainer.style.display = 'block';
    } else if (tabName === 'buildings') {
        if (buildingsContainer) buildingsContainer.style.display = 'block';
        if (jobsContainer) jobsContainer.style.display = 'none';
        if (upgradesContainer) upgradesContainer.style.display = 'none';
    } else if (tabName === 'jobs') {
        if (buildingsContainer) buildingsContainer.style.display = 'none';
        if (jobsContainer) jobsContainer.style.display = 'block';
        if (upgradesContainer) upgradesContainer.style.display = 'none';
    } else if (tabName === 'upgrades') {
        if (buildingsContainer) buildingsContainer.style.display = 'none';
        if (jobsContainer) jobsContainer.style.display = 'none';
        if (upgradesContainer) upgradesContainer.style.display = 'block';
    }
    
    // Store current tab
    villageGame.global.currentTab = tabName;
}

// Filter tabs function for building panel
window.filterTabs = filterTabs;

// Make updateWorkTime available globally
window.updateWorkTime = updateWorkTime;

// Update work time percentage
function updateWorkTime(percentage) {
    villageGame.global.workTimePercentage = parseInt(percentage);
    
    // Update the display
    const workTimeValueElement = document.getElementById('workTimeValue');
    if (workTimeValueElement) {
        workTimeValueElement.textContent = percentage;
    }
    
    // Update morale based on new work time
    updateMorale();
    
    // Update per-second displays to reflect the change
    updateResourcePerSecondDisplays();
    
    console.log("Work time set to:", percentage + "%");
}

// Update morale based on population and work time
function updateMorale() {
    const currentPopulation = Math.floor(villageGame.resources.peasants.owned);
    const workTime = villageGame.global.workTimePercentage;

    // Base morale starts at 100%
    let baseMorale = 100;

    // Population penalty: decrease by 2% for each person over 30
    if (currentPopulation > 30) {
        const populationOver30 = currentPopulation - 30;
        baseMorale = Math.max(0, 100 - (populationOver30 * 2));
    }

    // Work time bonus: lower work time = higher morale
    // At 100% work time: no bonus
    // At 50% work time: +25% morale bonus
    // At 0% work time: +50% morale bonus
    const workTimeBonus = (100 - workTime) * 0.5;

    // Temple bonus: +15% per temple
    const templeBonus = villageGame.global.templeBonus || 0;

    // Final morale = base morale + work time bonus + temple bonus, capped at 200%
    villageGame.global.morale = Math.min(200, baseMorale + workTimeBonus + templeBonus);

    // Update morale display
    const moraleValueElement = document.getElementById('moraleValue');
    if (moraleValueElement) {
        moraleValueElement.textContent = Math.round(villageGame.global.morale);
    }

    console.log("Morale updated to:", Math.round(villageGame.global.morale) + "% (Population:", currentPopulation + ", Work Time:", workTime + "%, Temple Bonus:", templeBonus + "%)");
}

// Update city type display
function updateCityType(cityType) {
    const cityTypeElement = document.getElementById('cityType');
    if (cityTypeElement) {
        cityTypeElement.textContent = cityType;
    }
}

// ============================================
// UPGRADE/RESEARCH SYSTEM
// ============================================

// Initialize upgrades - unlock all tier 1 upgrades when Library is built
function initializeUpgrades() {
    for (let upgradeName in villageGame.upgrades) {
        const upgrade = villageGame.upgrades[upgradeName];
        // Tier 1 upgrades are immediately available when Library is built
        if (upgrade.tier === 1) {
            upgrade.unlocked = true;
        }
    }
    updateUpgradesDisplay();
}

// Check if upgrade requirements are met
function checkUpgradeRequirements(upgradeName) {
    const upgrade = villageGame.upgrades[upgradeName];
    if (!upgrade) return false;

    // Check if all required upgrades have been purchased
    for (let req of upgrade.requires) {
        if (!villageGame.upgrades[req] || !villageGame.upgrades[req].purchased) {
            return false;
        }
    }
    return true;
}

// Check if upgrade can be afforded
function canAffordUpgrade(upgradeName) {
    const upgrade = villageGame.upgrades[upgradeName];
    if (!upgrade) return false;

    // Apply research cost reduction if Enlightenment is purchased
    const costReduction = 1 - (villageGame.global.upgradeBonus.researchCostReduction || 0);

    for (let resource in upgrade.cost) {
        const actualCost = Math.ceil(upgrade.cost[resource] * costReduction);
        if (!villageGame.resources[resource] || villageGame.resources[resource].owned < actualCost) {
            return false;
        }
    }
    return true;
}

// Purchase an upgrade
function purchaseUpgrade(upgradeName) {
    const upgrade = villageGame.upgrades[upgradeName];
    if (!upgrade) return false;

    // Check if already purchased
    if (upgrade.purchased) {
        addMessage("You have already researched this!", "Research");
        return false;
    }

    // Check requirements
    if (!checkUpgradeRequirements(upgradeName)) {
        addMessage("Prerequisites not met for this research!", "Research");
        return false;
    }

    // Check if can afford
    if (!canAffordUpgrade(upgradeName)) {
        addMessage("Not enough resources for this research!", "Research");
        return false;
    }

    // Apply research cost reduction
    const costReduction = 1 - (villageGame.global.upgradeBonus.researchCostReduction || 0);

    // Deduct costs
    for (let resource in upgrade.cost) {
        const actualCost = Math.ceil(upgrade.cost[resource] * costReduction);
        villageGame.resources[resource].owned -= actualCost;
        updateResourceDisplay(resource);
    }

    // Mark as purchased
    upgrade.purchased = true;

    // Apply the upgrade effect
    applyUpgradeEffect(upgradeName);

    // Unlock dependent upgrades
    unlockDependentUpgrades(upgradeName);

    // Update displays
    updateUpgradesDisplay();
    updateResourcePerSecondDisplays();

    addMessage(`Research Complete: ${formatUpgradeName(upgradeName)}! ${upgrade.effect}`, "Research");
    return true;
}

// Apply the effect of an upgrade
function applyUpgradeEffect(upgradeName) {
    const upgrade = villageGame.upgrades[upgradeName];
    const bonus = villageGame.global.upgradeBonus;

    switch (upgradeName) {
        // Tier 1
        case 'BetterTools':
            bonus.farmerProduction += upgrade.effectValue;
            bonus.woodcutterProduction += upgrade.effectValue;
            break;
        case 'EfficientGathering':
            bonus.gatheringSpeed += upgrade.effectValue;
            break;
        case 'BasicMedicine':
            bonus.herbalistProduction += upgrade.effectValue;
            break;
        case 'Cartography':
            bonus.explorationSpeed += upgrade.effectValue;
            break;

        // Tier 2
        case 'IronTools':
            bonus.allProduction += upgrade.effectValue;
            break;
        case 'Agriculture':
            bonus.farmerProduction += upgrade.effectValue;
            break;
        case 'Forestry':
            bonus.woodcutterProduction += upgrade.effectValue;
            break;
        case 'Geology':
            bonus.minerProduction += upgrade.effectValue;
            break;
        case 'AdvancedMedicine':
            bonus.deathRateReduction += upgrade.effectValue;
            break;
        case 'Navigation':
            bonus.explorationRewards += upgrade.effectValue;
            break;

        // Tier 3
        case 'SteelForging':
            bonus.allProduction += upgrade.effectValue;
            break;
        case 'CropRotation':
            bonus.farmerProduction += upgrade.effectValue;
            break;
        case 'MilitaryTactics':
            bonus.combatStrength += upgrade.effectValue;
            break;
        case 'TradeRoutes':
            bonus.merchantProduction += upgrade.effectValue;
            break;
        case 'Philosophy':
            bonus.scholarProduction += upgrade.effectValue;
            break;
        case 'Architecture':
            bonus.buildingCostReduction += upgrade.effectValue;
            break;

        // Tier 4
        case 'Industrialization':
            bonus.allProduction += upgrade.effectValue;
            break;
        case 'Diplomacy':
            bonus.immigrationRate += upgrade.effectValue;
            break;
        case 'WarMachines':
            bonus.combatStrength += upgrade.effectValue;
            break;
        case 'Enlightenment':
            bonus.researchCostReduction += upgrade.effectValue;
            break;
        case 'MasterBuilders':
            bonus.buildingCostReduction += upgrade.effectValue;
            break;
    }
}

// Unlock upgrades that depend on the purchased upgrade
function unlockDependentUpgrades(purchasedUpgrade) {
    for (let upgradeName in villageGame.upgrades) {
        const upgrade = villageGame.upgrades[upgradeName];
        if (upgrade.requires.includes(purchasedUpgrade) && !upgrade.unlocked) {
            // Check if all requirements are now met
            if (checkUpgradeRequirements(upgradeName)) {
                upgrade.unlocked = true;
            }
        }
    }
}

// Format upgrade name for display (add spaces before capitals)
function formatUpgradeName(name) {
    return name.replace(/([A-Z])/g, ' $1').trim();
}

// Format cost for display
function formatUpgradeCost(cost) {
    const resourceNames = {
        science: 'Knowledge',
        iron: 'Iron',
        gems: 'Gold',
        metal: 'Stone',
        food: 'Food',
        wood: 'Wood'
    };

    const costReduction = 1 - (villageGame.global.upgradeBonus.researchCostReduction || 0);
    const parts = [];
    for (let resource in cost) {
        const actualCost = Math.ceil(cost[resource] * costReduction);
        const name = resourceNames[resource] || resource;
        parts.push(`${actualCost} ${name}`);
    }
    return parts.join(', ');
}

// Update the upgrades display
function updateUpgradesDisplay() {
    const grid = document.getElementById('upgradesGrid');
    if (!grid) return;

    // Update knowledge display
    const knowledgeDisplay = document.getElementById('upgradeKnowledge');
    if (knowledgeDisplay) {
        knowledgeDisplay.textContent = Math.floor(villageGame.resources.science.owned);
    }

    // Get current filter
    const activeTab = document.querySelector('.upgrade-tab.active');
    const currentFilter = activeTab ? activeTab.getAttribute('data-category') : 'all';

    // Clear and rebuild
    grid.innerHTML = '';

    // Sort upgrades by tier, then by name
    const sortedUpgrades = Object.entries(villageGame.upgrades)
        .filter(([name, upgrade]) => upgrade.unlocked || upgrade.purchased)
        .filter(([name, upgrade]) => currentFilter === 'all' || upgrade.category === currentFilter)
        .sort((a, b) => {
            if (a[1].tier !== b[1].tier) return a[1].tier - b[1].tier;
            return a[0].localeCompare(b[0]);
        });

    for (let [upgradeName, upgrade] of sortedUpgrades) {
        const card = document.createElement('div');
        card.className = 'upgrade-card';
        card.setAttribute('data-upgrade', upgradeName);

        // Check status
        const requirementsMet = checkUpgradeRequirements(upgradeName);
        const affordable = canAffordUpgrade(upgradeName);

        if (upgrade.purchased) {
            card.classList.add('purchased');
        } else if (!requirementsMet) {
            card.classList.add('locked');
        } else if (affordable) {
            card.classList.add('affordable');
        }

        // Build card content
        let html = `
            <div class="upgrade-tier tier-${upgrade.tier}">Tier ${upgrade.tier}</div>
            <div class="upgrade-name">${formatUpgradeName(upgradeName)}</div>
            <div class="upgrade-description">${upgrade.description}</div>
            <div class="upgrade-effect">${upgrade.effect}</div>
        `;

        if (!upgrade.purchased) {
            html += `<div class="upgrade-cost">Cost: ${formatUpgradeCost(upgrade.cost)}</div>`;

            if (upgrade.requires.length > 0 && !requirementsMet) {
                const reqNames = upgrade.requires.map(r => formatUpgradeName(r)).join(', ');
                html += `<div class="upgrade-requires">Requires: ${reqNames}</div>`;
            }
        }

        card.innerHTML = html;

        // Add click handler
        if (!upgrade.purchased && requirementsMet) {
            card.addEventListener('click', () => purchaseUpgrade(upgradeName));
        }

        grid.appendChild(card);
    }
}

// Filter upgrades by category
function filterUpgrades(category) {
    // Update active tab
    document.querySelectorAll('.upgrade-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-category') === category) {
            tab.classList.add('active');
        }
    });

    updateUpgradesDisplay();
}

// ============================================
// SAVE/LOAD SYSTEM
// ============================================

// Save game state
function save(exportMode) {
    const saveData = {
        version: 3,
        timestamp: Date.now(),
        resources: villageGame.resources,
        buildings: villageGame.buildings,
        jobs: villageGame.jobs,
        global: villageGame.global,
        map: villageGame.map,
        upgrades: villageGame.upgrades,
        prestige: villageGame.prestige
    };

    const saveString = JSON.stringify(saveData);
    const compressed = btoa(saveString); // Base64 encode for export

    if (exportMode) {
        // Return compressed string for export
        return compressed;
    } else {
        // Save to localStorage
        try {
            localStorage.setItem('theVillageSave', compressed);
            console.log('Game saved successfully!');
            return true;
        } catch (e) {
            console.error('Failed to save game:', e);
            return false;
        }
    }
}

// Load game state
function load(saveData) {
    try {
        let compressed;

        if (saveData) {
            // Load from provided string (import)
            compressed = saveData;
        } else {
            // Load from localStorage
            compressed = localStorage.getItem('theVillageSave');
            if (!compressed) {
                console.log('No save data found.');
                return false;
            }
        }

        // Decompress and parse
        const saveString = atob(compressed);
        const data = JSON.parse(saveString);

        // Version check for future migrations
        if (data.version !== 1) {
            console.warn('Save version mismatch, attempting to load anyway...');
        }

        // Restore game state
        if (data.resources) {
            for (let key in data.resources) {
                if (villageGame.resources[key]) {
                    villageGame.resources[key] = data.resources[key];
                }
            }
        }

        if (data.buildings) {
            for (let key in data.buildings) {
                if (villageGame.buildings[key]) {
                    villageGame.buildings[key] = data.buildings[key];
                }
            }
        }

        if (data.jobs) {
            for (let key in data.jobs) {
                if (villageGame.jobs[key]) {
                    villageGame.jobs[key] = data.jobs[key];
                }
            }
        }

        if (data.global) {
            for (let key in data.global) {
                if (villageGame.global.hasOwnProperty(key)) {
                    villageGame.global[key] = data.global[key];
                }
            }
        }

        if (data.map) {
            villageGame.map = data.map;
        }

        // Restore upgrades (version 2+)
        if (data.upgrades) {
            for (let key in data.upgrades) {
                if (villageGame.upgrades[key]) {
                    villageGame.upgrades[key] = data.upgrades[key];
                }
            }
        }

        // Restore prestige data (version 3+)
        if (data.prestige) {
            // Restore scalar values
            villageGame.prestige.legacyPoints = data.prestige.legacyPoints || 0;
            villageGame.prestige.totalLegacyPointsEarned = data.prestige.totalLegacyPointsEarned || 0;
            villageGame.prestige.timesPrestiged = data.prestige.timesPrestiged || 0;
            villageGame.prestige.dragonsSlain = data.prestige.dragonsSlain || 0;
            villageGame.prestige.unlocked = data.prestige.unlocked || false;

            // Restore bonuses
            if (data.prestige.bonuses) {
                for (let key in data.prestige.bonuses) {
                    if (villageGame.prestige.bonuses.hasOwnProperty(key)) {
                        villageGame.prestige.bonuses[key] = data.prestige.bonuses[key];
                    }
                }
            }

            // Restore prestige upgrades (purchased levels)
            if (data.prestige.upgrades) {
                for (let key in data.prestige.upgrades) {
                    if (villageGame.prestige.upgrades[key]) {
                        villageGame.prestige.upgrades[key].purchased = data.prestige.upgrades[key].purchased || 0;
                    }
                }
            }
        }

        console.log('Game loaded successfully! Save from:', new Date(data.timestamp).toLocaleString());
        return true;
    } catch (e) {
        console.error('Failed to load game:', e);
        throw e; // Re-throw for UI error handling
    }
}

// Auto-save every 30 seconds
function startAutoSave() {
    setInterval(() => {
        save();
    }, 30000);
    console.log('Auto-save enabled (every 30 seconds)');
}

// Clear save data
function clearSave() {
    if (confirm('Are you sure you want to delete your save? This cannot be undone!')) {
        localStorage.removeItem('theVillageSave');
        location.reload();
    }
}

// Make save/load functions globally available
window.save = save;
window.load = load;
window.clearSave = clearSave;

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Try to load existing save
    const hasSave = load();

    // Initialize our village game
    setTimeout(() => {
        initVillageGame();

        // If we loaded a save, update all displays
        if (hasSave) {
            updateAllDisplays();

            // Restore UI state for unlocked elements
            restoreUnlockedUI();
        }

        // Start auto-save
        startAutoSave();

        // Add upgrade tab event listeners
        document.querySelectorAll('.upgrade-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const category = tab.getAttribute('data-category');
                filterUpgrades(category);
            });
        });

        // Initialize prestige button
        initializePrestigeButton();
    }, 100);
});

// Restore UI visibility for unlocked elements after loading
function restoreUnlockedUI() {
    // Restore job visibility
    if (villageGame.global.jobsUnlocked) {
        const farmerElement = document.querySelector('[data-job="Farmer"]');
        const woodcutterElement = document.querySelector('[data-job="Woodcutter"]');
        if (farmerElement) farmerElement.style.display = 'block';
        if (woodcutterElement) woodcutterElement.style.display = 'block';
    }

    if (villageGame.global.herbalistUnlocked) {
        const herbalistElement = document.querySelector('[data-job="Herbalist"]');
        if (herbalistElement) herbalistElement.style.display = 'block';
        showResource('herbs');
    }

    if (villageGame.global.explorerUnlocked) {
        const explorerElement = document.querySelector('[data-job="Explorer"]');
        if (explorerElement) explorerElement.style.display = 'block';
    }

    if (villageGame.global.expeditionUnlocked) {
        const expeditionPanel = document.getElementById('expeditionPanel');
        if (expeditionPanel) expeditionPanel.style.display = 'block';
    }

    // Restore building visibility
    if (villageGame.buildings.WoodenHut.unlocked) {
        const woodenHutElement = document.querySelector('[data-building="WoodenHut"]');
        if (woodenHutElement) woodenHutElement.style.display = 'block';
    }

    if (villageGame.buildings.Granary.unlocked) {
        const granaryElement = document.querySelector('[data-building="Granary"]');
        if (granaryElement) granaryElement.style.display = 'block';
    }

    if (villageGame.buildings.Lumberyard.unlocked) {
        const lumberyardElement = document.querySelector('[data-building="Lumberyard"]');
        if (lumberyardElement) lumberyardElement.style.display = 'block';
    }

    if (villageGame.buildings.HerbGarden.unlocked) {
        const herbGardenElement = document.querySelector('[data-building="HerbGarden"]');
        if (herbGardenElement) herbGardenElement.style.display = 'block';
    }

    // Restore new building visibility
    if (villageGame.buildings.Quarry && villageGame.buildings.Quarry.unlocked) {
        const quarryElement = document.querySelector('[data-building="Quarry"]');
        if (quarryElement) quarryElement.style.display = 'block';
        showResource('metal');
    }

    if (villageGame.buildings.Workshop && villageGame.buildings.Workshop.unlocked) {
        const workshopElement = document.querySelector('[data-building="Workshop"]');
        if (workshopElement) workshopElement.style.display = 'block';
    }

    if (villageGame.buildings.Library && villageGame.buildings.Library.unlocked) {
        const libraryElement = document.querySelector('[data-building="Library"]');
        if (libraryElement) libraryElement.style.display = 'block';
        showResource('science');
    }

    if (villageGame.buildings.Market && villageGame.buildings.Market.unlocked) {
        const marketElement = document.querySelector('[data-building="Market"]');
        if (marketElement) marketElement.style.display = 'block';
        showResource('gems');
    }

    if (villageGame.buildings.Temple && villageGame.buildings.Temple.unlocked) {
        const templeElement = document.querySelector('[data-building="Temple"]');
        if (templeElement) templeElement.style.display = 'block';
    }

    if (villageGame.buildings.Barracks && villageGame.buildings.Barracks.unlocked) {
        const barracksElement = document.querySelector('[data-building="Barracks"]');
        if (barracksElement) barracksElement.style.display = 'block';
        showResource('iron');
    }

    // Restore new job visibility
    if (villageGame.jobs.Miner && villageGame.jobs.Miner.unlocked) {
        const minerElement = document.querySelector('[data-job="Miner"]');
        if (minerElement) minerElement.style.display = 'block';
    }

    if (villageGame.jobs.Scholar && villageGame.jobs.Scholar.unlocked) {
        const scholarElement = document.querySelector('[data-job="Scholar"]');
        if (scholarElement) scholarElement.style.display = 'block';
    }

    if (villageGame.jobs.Merchant && villageGame.jobs.Merchant.unlocked) {
        const merchantElement = document.querySelector('[data-job="Merchant"]');
        if (merchantElement) merchantElement.style.display = 'block';
    }

    if (villageGame.jobs.Soldier && villageGame.jobs.Soldier.unlocked) {
        const soldierElement = document.querySelector('[data-job="Soldier"]');
        if (soldierElement) soldierElement.style.display = 'block';
    }

    // Restore rate display visibility
    if (villageGame.global.birthRateUnlocked) {
        const birthRateElement = document.getElementById('birthRate');
        if (birthRateElement) birthRateElement.style.display = 'block';
    }

    if (villageGame.global.deathUnlocked) {
        const deathRateElement = document.getElementById('deathRate');
        if (deathRateElement) deathRateElement.style.display = 'block';
    }

    // Update campfire state based on wood consumption
    if (villageGame.global.woodConsumption > 0) {
        villageGame.global.campfireActive = villageGame.resources.wood.owned > 0;
    }

    // Restore upgrades panel visibility
    if (villageGame.global.upgradesUnlocked) {
        const upgradesPanel = document.getElementById('upgradesPanel');
        if (upgradesPanel) {
            upgradesPanel.style.display = 'block';
        }

        // Re-apply all purchased upgrade effects
        for (let upgradeName in villageGame.upgrades) {
            if (villageGame.upgrades[upgradeName].purchased) {
                applyUpgradeEffect(upgradeName);
            }
        }

        // Update the upgrades display
        updateUpgradesDisplay();
    }

    console.log('UI state restored from save');

    // Restore prestige panel visibility
    if (villageGame.prestige.unlocked) {
        const prestigePanel = document.getElementById('prestigePanel');
        if (prestigePanel) {
            prestigePanel.style.display = 'block';
        }
        updatePrestigeDisplay();
    }
}

// =============================================
// PRESTIGE SYSTEM
// =============================================

// Unlock prestige system (called when dragon is defeated)
function unlockPrestige() {
    if (!villageGame.prestige.unlocked) {
        villageGame.prestige.unlocked = true;
        villageGame.prestige.dragonsSlain++;

        const prestigePanel = document.getElementById('prestigePanel');
        if (prestigePanel) {
            prestigePanel.style.display = 'block';
        }

        addMessage("With the dragon defeated, your legend spreads across the land. The spirits of your ancestors whisper of a greater power - the ability to pass on your wisdom to future generations.", "Prestige");
        addMessage("Prestige System Unlocked", "Unlock");

        updatePrestigeDisplay();
    } else {
        // Dragon defeated again
        villageGame.prestige.dragonsSlain++;
        addMessage("Another dragon has been slain! Your legend grows even greater.", "Prestige");
        updatePrestigeDisplay();
    }
}

// Calculate legacy points that would be earned from current progress
function calculateLegacyPoints() {
    let points = 0;
    let breakdown = [];

    // Points from population (1 point per 10 peasants)
    const populationPoints = Math.floor(villageGame.resources.peasants.owned / 10);
    if (populationPoints > 0) {
        points += populationPoints;
        breakdown.push(`Population: ${populationPoints}`);
    }

    // Points from buildings (1 point per building owned)
    let buildingPoints = 0;
    for (let buildingName in villageGame.buildings) {
        buildingPoints += villageGame.buildings[buildingName].owned || 0;
    }
    if (buildingPoints > 0) {
        points += buildingPoints;
        breakdown.push(`Buildings: ${buildingPoints}`);
    }

    // Points from upgrades (2 points per upgrade purchased)
    let upgradePoints = 0;
    for (let upgradeName in villageGame.upgrades) {
        if (villageGame.upgrades[upgradeName].purchased) {
            upgradePoints += 2;
        }
    }
    if (upgradePoints > 0) {
        points += upgradePoints;
        breakdown.push(`Research: ${upgradePoints}`);
    }

    // Points from monsters defeated (1 point per 5 monsters)
    const monsterPoints = Math.floor((villageGame.global.monstersDefeated || 0) / 5);
    if (monsterPoints > 0) {
        points += monsterPoints;
        breakdown.push(`Monsters: ${monsterPoints}`);
    }

    // Bonus for defeating the dragon (10 points)
    if (villageGame.global.bossDefeated) {
        points += 10;
        breakdown.push(`Dragon: 10`);
    }

    // Points from explored tiles (1 point per 10 tiles)
    const explorationPoints = Math.floor((villageGame.map.exploredTiles || 0) / 10);
    if (explorationPoints > 0) {
        points += explorationPoints;
        breakdown.push(`Exploration: ${explorationPoints}`);
    }

    return { points, breakdown };
}

// Update prestige display
function updatePrestigeDisplay() {
    // Update legacy points
    const legacyPointsElement = document.getElementById('prestigeLegacyPoints');
    if (legacyPointsElement) {
        legacyPointsElement.textContent = villageGame.prestige.legacyPoints;
    }

    // Update times reset
    const timesResetElement = document.getElementById('prestigeTimesReset');
    if (timesResetElement) {
        timesResetElement.textContent = villageGame.prestige.timesPrestiged;
    }

    // Update dragons slain
    const dragonsSlainElement = document.getElementById('prestigeDragonsSlain');
    if (dragonsSlainElement) {
        dragonsSlainElement.textContent = villageGame.prestige.dragonsSlain;
    }

    // Update preview points
    const { points, breakdown } = calculateLegacyPoints();
    const previewPointsElement = document.getElementById('prestigePreviewPoints');
    if (previewPointsElement) {
        previewPointsElement.textContent = points;
    }

    const previewBreakdownElement = document.getElementById('prestigePreviewBreakdown');
    if (previewBreakdownElement) {
        if (breakdown.length > 0) {
            previewBreakdownElement.textContent = `(${breakdown.join(' + ')})`;
        } else {
            previewBreakdownElement.textContent = '(No points earned yet)';
        }
    }

    // Enable/disable prestige button
    const prestigeButton = document.getElementById('prestigeButton');
    if (prestigeButton) {
        // Can only prestige if dragon has been defeated this run
        const canPrestige = villageGame.global.bossDefeated && points > 0;
        prestigeButton.disabled = !canPrestige;
    }

    // Update prestige upgrades grid
    updatePrestigeUpgradesGrid();

    // Update current bonuses display
    updatePrestigeBonusesDisplay();
}

// Update prestige upgrades grid
function updatePrestigeUpgradesGrid() {
    const grid = document.getElementById('prestigeUpgradesGrid');
    if (!grid) return;

    grid.innerHTML = '';

    for (let upgradeName in villageGame.prestige.upgrades) {
        const upgrade = villageGame.prestige.upgrades[upgradeName];
        const isMaxed = upgrade.purchased >= upgrade.maxLevel;
        const currentCost = Math.ceil(upgrade.cost * Math.pow(upgrade.costScale, upgrade.purchased));
        const canAfford = villageGame.prestige.legacyPoints >= currentCost && !isMaxed;

        const card = document.createElement('div');
        card.className = `prestige-upgrade-card${isMaxed ? ' maxed' : ''}${canAfford ? ' affordable' : ''}`;
        card.setAttribute('data-upgrade', upgradeName);

        card.innerHTML = `
            <div class="prestige-upgrade-name">${formatPrestigeUpgradeName(upgradeName)}</div>
            <div class="prestige-upgrade-level">Level: ${upgrade.purchased}/${upgrade.maxLevel}</div>
            <div class="prestige-upgrade-description">${upgrade.description}</div>
            <div class="prestige-upgrade-effect">${upgrade.effect}</div>
            ${!isMaxed ? `<div class="prestige-upgrade-cost">Cost: ${currentCost} LP</div>` : ''}
        `;

        if (!isMaxed) {
            card.onclick = () => purchasePrestigeUpgrade(upgradeName);
        }

        grid.appendChild(card);
    }
}

// Update current bonuses display
function updatePrestigeBonusesDisplay() {
    const grid = document.getElementById('prestigeBonusesGrid');
    if (!grid) return;

    grid.innerHTML = '';

    const bonuses = villageGame.prestige.bonuses;
    const bonusLabels = {
        startingResources: 'Starting Resources',
        productionMultiplier: 'Production',
        explorationBonus: 'Exploration Speed',
        combatBonus: 'Combat Strength',
        populationCapBonus: 'Population Cap',
        costReduction: 'Cost Reduction',
        immigrationBonus: 'Immigration Speed'
    };

    for (let bonusName in bonuses) {
        const value = bonuses[bonusName];
        if (value > 0) {
            const item = document.createElement('div');
            item.className = 'prestige-bonus-item';

            let displayValue = '';
            if (bonusName === 'startingResources' || bonusName === 'populationCapBonus') {
                displayValue = `+${value}`;
            } else {
                displayValue = `+${Math.round(value * 100)}%`;
            }

            item.innerHTML = `
                <span class="prestige-bonus-label">${bonusLabels[bonusName] || bonusName}:</span>
                <span class="prestige-bonus-value">${displayValue}</span>
            `;
            grid.appendChild(item);
        }
    }

    // Show message if no bonuses yet
    if (grid.children.length === 0) {
        grid.innerHTML = '<div class="prestige-bonus-item"><span class="prestige-bonus-label">No bonuses yet - purchase Legacy Upgrades!</span></div>';
    }
}

// Format prestige upgrade name for display
function formatPrestigeUpgradeName(name) {
    return name.replace(/([A-Z])/g, ' $1').trim();
}

// Purchase a prestige upgrade
function purchasePrestigeUpgrade(upgradeName) {
    const upgrade = villageGame.prestige.upgrades[upgradeName];
    if (!upgrade) return;

    // Check if already maxed
    if (upgrade.purchased >= upgrade.maxLevel) {
        addMessage(`${formatPrestigeUpgradeName(upgradeName)} is already at max level!`, "Loot");
        return;
    }

    // Calculate cost
    const cost = Math.ceil(upgrade.cost * Math.pow(upgrade.costScale, upgrade.purchased));

    // Check if we can afford
    if (villageGame.prestige.legacyPoints < cost) {
        addMessage(`Not enough Legacy Points! Need ${cost}, have ${villageGame.prestige.legacyPoints}.`, "Loot");
        return;
    }

    // Deduct cost
    villageGame.prestige.legacyPoints -= cost;

    // Increase level
    upgrade.purchased++;

    // Apply the bonus
    applyPrestigeUpgradeBonus(upgradeName);

    addMessage(`${formatPrestigeUpgradeName(upgradeName)} upgraded to level ${upgrade.purchased}!`, "Prestige");

    // Update display
    updatePrestigeDisplay();
}

// Apply prestige upgrade bonus
function applyPrestigeUpgradeBonus(upgradeName) {
    const upgrade = villageGame.prestige.upgrades[upgradeName];
    const bonuses = villageGame.prestige.bonuses;

    switch (upgradeName) {
        case 'ResourceHeadstart':
            bonuses.startingResources = upgrade.purchased * upgrade.effectValue;
            break;
        case 'VeteranWorkers':
            bonuses.productionMultiplier = upgrade.purchased * upgrade.effectValue;
            break;
        case 'ExperiencedExplorers':
            bonuses.explorationBonus = upgrade.purchased * upgrade.effectValue;
            break;
        case 'BattleHardened':
            bonuses.combatBonus = upgrade.purchased * upgrade.effectValue;
            break;
        case 'ExpandedSettlement':
            bonuses.populationCapBonus = upgrade.purchased * upgrade.effectValue;
            break;
        case 'EfficientDesigns':
            bonuses.costReduction = upgrade.purchased * upgrade.effectValue;
            break;
        case 'FamousVillage':
            bonuses.immigrationBonus = upgrade.purchased * upgrade.effectValue;
            break;
        case 'DragonslayerLegacy':
            // Special bonus - already applied at game start
            break;
    }
}

// Perform prestige reset
function performPrestige() {
    // Calculate and award legacy points
    const { points } = calculateLegacyPoints();
    villageGame.prestige.legacyPoints += points;
    villageGame.prestige.totalLegacyPointsEarned += points;
    villageGame.prestige.timesPrestiged++;

    addMessage(`Prestige complete! Earned ${points} Legacy Points.`, "Prestige");

    // Save prestige data before reset
    const prestigeData = JSON.parse(JSON.stringify(villageGame.prestige));

    // Reset game to initial state
    resetGameState();

    // Restore prestige data
    villageGame.prestige = prestigeData;

    // Apply prestige bonuses to new game
    applyPrestigeBonusesToNewGame();

    // Save the new state
    save();

    // Refresh the page to reinitialize
    location.reload();
}

// Reset game state (keep prestige)
function resetGameState() {
    // Reset resources
    for (let resource in villageGame.resources) {
        villageGame.resources[resource].owned = 0;
    }
    villageGame.resources.food.max = 100;
    villageGame.resources.wood.max = 100;
    villageGame.resources.metal.max = 100;
    villageGame.resources.herbs.max = 50;
    villageGame.resources.iron.max = 100;
    villageGame.resources.peasants.max = 10;

    // Reset buildings
    for (let building in villageGame.buildings) {
        villageGame.buildings[building].owned = 0;
        // Reset cost to base cost
        if (villageGame.buildings[building].baseCost) {
            villageGame.buildings[building].cost = JSON.parse(JSON.stringify(villageGame.buildings[building].baseCost));
        }
        // Reset unlock status (except Campfire)
        if (building !== 'Campfire') {
            villageGame.buildings[building].unlocked = false;
        }
    }

    // Reset jobs
    for (let job in villageGame.jobs) {
        villageGame.jobs[job].owned = 0;
        villageGame.jobs[job].unlocked = false;
    }

    // Reset upgrades
    for (let upgrade in villageGame.upgrades) {
        villageGame.upgrades[upgrade].purchased = false;
        villageGame.upgrades[upgrade].unlocked = false;
    }

    // Reset global state
    villageGame.global.playerGathering = "";
    villageGame.global.woodConsumption = 0;
    villageGame.global.campfireActive = true;
    villageGame.global.workTimePercentage = 100;
    villageGame.global.morale = 100;
    villageGame.global.deathUnlocked = false;
    villageGame.global.firstDeathTriggered = false;
    villageGame.global.deathCount = 0;
    villageGame.global.herbalistUnlocked = false;
    villageGame.global.birthAccumulator = 0;
    villageGame.global.deathAccumulator = 0;
    villageGame.global.campfireAccumulator = 0;
    villageGame.global.explorationAccumulator = 0;
    villageGame.global.population10StoryTriggered = false;
    villageGame.global.jobsUnlocked = false;
    villageGame.global.granaryUnlocked = false;
    villageGame.global.lumberyardUnlocked = false;
    villageGame.global.herbGardenUnlocked = false;
    villageGame.global.moraleSystemUnlocked = false;
    villageGame.global.birthRateUnlocked = false;
    villageGame.global.firstChildBorn = false;
    villageGame.global.explorerUnlocked = false;
    villageGame.global.expeditionUnlocked = false;
    villageGame.global.expeditionPartySize = 0;
    villageGame.global.expeditionActive = false;
    villageGame.global.quarryUnlocked = false;
    villageGame.global.workshopUnlocked = false;
    villageGame.global.libraryUnlocked = false;
    villageGame.global.marketUnlocked = false;
    villageGame.global.templeUnlocked = false;
    villageGame.global.barracksUnlocked = false;
    villageGame.global.monsterDiscovered = false;
    villageGame.global.workshopBonus = 0;
    villageGame.global.templeBonus = 0;
    villageGame.global.combatStrength = 0;
    villageGame.global.monstersDefeated = 0;
    villageGame.global.bossDefeated = false;
    villageGame.global.upgradesUnlocked = false;

    // Reset upgrade bonuses
    for (let bonus in villageGame.global.upgradeBonus) {
        villageGame.global.upgradeBonus[bonus] = 0;
    }

    // Reset map
    villageGame.map.tiles = [];
    villageGame.map.exploredTiles = 0;
}

// Apply prestige bonuses to new game
function applyPrestigeBonusesToNewGame() {
    const bonuses = villageGame.prestige.bonuses;
    const upgrades = villageGame.prestige.upgrades;

    // Apply starting resources bonus
    if (bonuses.startingResources > 0) {
        villageGame.resources.food.owned = bonuses.startingResources;
        villageGame.resources.wood.owned = bonuses.startingResources;
    }

    // Apply population cap bonus
    if (bonuses.populationCapBonus > 0) {
        villageGame.resources.peasants.max += bonuses.populationCapBonus;
    }

    // Apply Dragonslayer Legacy special bonus
    if (upgrades.DragonslayerLegacy && upgrades.DragonslayerLegacy.purchased > 0) {
        villageGame.resources.food.owned += 100;
        villageGame.resources.wood.owned += 100;
        villageGame.resources.metal.owned += 100;
        villageGame.resources.herbs.owned += 100;
        villageGame.resources.iron.owned += 100;
        villageGame.resources.peasants.max += 20;
    }

    // Apply Ancient Knowledge bonus (unlock tier 1 upgrades)
    if (upgrades.AncientKnowledge && upgrades.AncientKnowledge.purchased > 0) {
        let tier1Unlocked = 0;
        const tier1Upgrades = ['BetterTools', 'EfficientGathering', 'BasicMedicine', 'Cartography'];
        for (let upgrade of tier1Upgrades) {
            if (tier1Unlocked < upgrades.AncientKnowledge.purchased && villageGame.upgrades[upgrade]) {
                villageGame.upgrades[upgrade].unlocked = true;
                tier1Unlocked++;
            }
        }
    }
}

// Apply prestige production bonus (called in job production calculation)
function getPrestigeProductionBonus() {
    return villageGame.prestige.bonuses.productionMultiplier || 0;
}

// Apply prestige exploration bonus (called in exploration calculation)
function getPrestigeExplorationBonus() {
    return villageGame.prestige.bonuses.explorationBonus || 0;
}

// Apply prestige combat bonus (called in combat calculation)
function getPrestigeCombatBonus() {
    return villageGame.prestige.bonuses.combatBonus || 0;
}

// Apply prestige cost reduction (called in building/research cost calculation)
function getPrestigeCostReduction() {
    return villageGame.prestige.bonuses.costReduction || 0;
}

// Apply prestige immigration bonus (called in immigration calculation)
function getPrestigeImmigrationBonus() {
    return villageGame.prestige.bonuses.immigrationBonus || 0;
}

// Initialize prestige button event listener
function initializePrestigeButton() {
    const prestigeButton = document.getElementById('prestigeButton');
    if (prestigeButton) {
        prestigeButton.onclick = function() {
            if (confirm('Are you sure you want to prestige? This will reset all progress except Legacy upgrades!')) {
                performPrestige();
            }
        };
    }
}
