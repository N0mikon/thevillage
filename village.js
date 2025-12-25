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
            const totalEmployed = villageGame.jobs.Farmer.owned + villageGame.jobs.Woodcutter.owned + villageGame.jobs.Herbalist.owned + villageGame.jobs.Explorer.owned;
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
                const availableJobs = [];
                if (villageGame.jobs.Farmer.owned > 0) availableJobs.push('Farmer');
                if (villageGame.jobs.Woodcutter.owned > 0) availableJobs.push('Woodcutter');
                if (villageGame.jobs.Herbalist.owned > 0) availableJobs.push('Herbalist');
                if (villageGame.jobs.Explorer.owned > 0) availableJobs.push('Explorer');
                
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
    
    // Define possible tile types and their probabilities
    const tileTypes = [
        { type: 'empty', probability: 0.5, name: 'Empty Land', resources: 0 },
        { type: 'trees', probability: 0.3, name: 'Forest', resources: Math.floor(Math.random() * 30) + 10 },
        { type: 'monster', probability: 0.2, name: 'Monster Den', resources: 0 }
    ];
    
    // Generate tiles
    for (let y = 0; y < map.height; y++) {
        map.tiles[y] = [];
        for (let x = 0; x < map.width; x++) {
            // Place boss in top right corner (0,0 in our coordinate system)
            if (x === 0 && y === 0) {
                map.tiles[y][x] = {
                    x: x,
                    y: y,
                    type: 'boss',
                    name: 'Boss Lair',
                    explored: false,
                    resources: 0
                };
            } else {
                const random = Math.random();
                let cumulativeProbability = 0;
                let selectedTile = tileTypes[0]; // Default to empty
                
                for (const tileType of tileTypes) {
                    cumulativeProbability += tileType.probability;
                    if (random <= cumulativeProbability) {
                        selectedTile = tileType;
                        break;
                    }
                }
                
                map.tiles[y][x] = {
                    x: x,
                    y: y,
                    type: selectedTile.type,
                    name: selectedTile.name,
                    explored: false,
                    resources: selectedTile.type === 'trees' ? Math.floor(Math.random() * 30) + 10 : 0 // Only trees have resources for now
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
    
    // Calculate exploration rate (0.1 tile per second per expedition explorer)
    const workEfficiency = villageGame.global.workTimePercentage / 100;
    const moraleEfficiency = villageGame.global.morale / 100;
    const explorationRate = (expeditionExplorers * 0.1 * workEfficiency * moraleEfficiency) / villageGame.settings.speed;
    
    // Add to exploration accumulator
    if (!villageGame.global.explorationAccumulator) {
        villageGame.global.explorationAccumulator = 0;
    }
    villageGame.global.explorationAccumulator += explorationRate;
    
        // Check if we've accumulated enough for a whole tile exploration
        if (villageGame.global.explorationAccumulator >= 1.0) {
            // Find the next unexplored tile in order (bottom left to top right)
            let nextTile = null;
            for (let y = villageGame.map.height - 1; y >= 0; y--) {
                for (let x = 0; x < villageGame.map.width; x++) {
                    if (!villageGame.map.tiles[y][x].explored) {
                        nextTile = villageGame.map.tiles[y][x];
                        break;
                    }
                }
                if (nextTile) break;
            }
            
            if (nextTile) {
                nextTile.explored = true;
                villageGame.map.exploredTiles++;
            
            // Add resources based on tile type
            if (nextTile.type === 'trees' && nextTile.resources > 0) {
                // Trees give wood
                villageGame.resources.wood.owned += nextTile.resources;
                
                // Check max limits
                if (villageGame.resources.wood.max > 0 && 
                    villageGame.resources.wood.owned > villageGame.resources.wood.max) {
                    villageGame.resources.wood.owned = villageGame.resources.wood.max;
                }
                
                // Update display
                updateResourceDisplay('wood');
                
                // Add exploration message
                addMessage(`Explorers discovered ${nextTile.name} containing ${nextTile.resources} wood!`, "Loot");
            } else if (nextTile.type === 'monster') {
                addMessage(`Explorers discovered a ${nextTile.name}! They quickly retreat for now.`, "Loot");
            } else if (nextTile.type === 'boss') {
                addMessage(`Explorers discovered the ${nextTile.name}! A powerful boss awaits...`, "Loot");
    } else {
                addMessage(`Explorers explored ${nextTile.name} but found nothing of value.`, "Loot");
            }
            
            // Update map display
            updateMapDisplay();
        }
        
        // Reset accumulator (keep any remainder)
        villageGame.global.explorationAccumulator -= 1.0;
    }
}

// Update map display
function updateMapDisplay() {
    const mapPanel = document.querySelector('.map-panel');
    if (!mapPanel) return;
    
    const map = villageGame.map;
    let mapHTML = '<div class="map-grid">';
    
    for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {
            const tile = map.tiles[y][x];
            const tileClass = tile.explored ? 'map-tile explored' : 'map-tile unexplored';
            const tileContent = tile.explored ? 
                `<div class="tile-type">${tile.name}</div>` + 
                (tile.resources > 0 ? `<div class="tile-resources">${tile.resources}</div>` : '') :
                '<div class="tile-type">?</div>';
            
            mapHTML += `<div class="${tileClass}" data-x="${x}" data-y="${y}">${tileContent}</div>`;
        }
    }
    
    mapHTML += '</div>';
    mapHTML += `<div class="map-stats">Explored: ${map.exploredTiles}/${map.width * map.height} tiles</div>`;
    
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
    
    // Check if we have enough resources
    for (let resource in building.cost) {
        if (villageGame.resources[resource].owned < building.cost[resource]) {
            addMessage(`Not enough ${resource}! Need ${building.cost[resource]}, have ${Math.floor(villageGame.resources[resource].owned)}.`, "Loot");
            return false;
        }
    }
    
    // Deduct resources
    for (let resource in building.cost) {
        villageGame.resources[resource].owned -= building.cost[resource];
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
    const totalEmployed = villageGame.jobs.Farmer.owned + villageGame.jobs.Woodcutter.owned + villageGame.jobs.Herbalist.owned + villageGame.jobs.Explorer.owned;
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
            messageClass = 'LootMessage';
            icon = '⚔️';
            dataType = 'combat';
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
    // Update Campfire owned count
    const campfireOwnedElement = document.querySelector('[data-building="Campfire"] .building-owned');
    if (campfireOwnedElement) {
        campfireOwnedElement.textContent = `Owned: ${villageGame.buildings.Campfire.owned}`;
    }
    
    // Update Campfire cost
    const campfireCostElement = document.querySelector('[data-building="Campfire"] .building-cost');
    if (campfireCostElement) {
        const cost = villageGame.buildings.Campfire.cost.wood;
        campfireCostElement.textContent = `Cost: ${cost} Wood`;
    }
    
    // Update Wooden Hut owned count
    const woodenHutOwnedElement = document.querySelector('[data-building="WoodenHut"] .building-owned');
    if (woodenHutOwnedElement) {
        woodenHutOwnedElement.textContent = `Owned: ${villageGame.buildings.WoodenHut.owned}`;
    }
    
    // Update Wooden Hut cost
    const woodenHutCostElement = document.querySelector('[data-building="WoodenHut"] .building-cost');
    if (woodenHutCostElement) {
        const cost = villageGame.buildings.WoodenHut.cost.wood;
        woodenHutCostElement.textContent = `Cost: ${cost} Wood`;
    }
    
    // Show/hide Wooden Hut based on unlock status
    const woodenHutElement = document.querySelector('[data-building="WoodenHut"]');
    if (woodenHutElement) {
        woodenHutElement.style.display = villageGame.buildings.WoodenHut.unlocked ? 'block' : 'none';
    }
    
    // Update Granary owned count
    const granaryOwnedElement = document.querySelector('[data-building="Granary"] .building-owned');
    if (granaryOwnedElement) {
        granaryOwnedElement.textContent = `Owned: ${villageGame.buildings.Granary.owned}`;
    }
    
    // Update Granary cost
    const granaryCostElement = document.querySelector('[data-building="Granary"] .building-cost');
    if (granaryCostElement) {
        const woodCost = villageGame.buildings.Granary.cost.wood;
        const foodCost = villageGame.buildings.Granary.cost.food;
        granaryCostElement.textContent = `Cost: ${woodCost} Wood, ${foodCost} Food`;
    }
    
    // Show/hide Granary based on unlock status
    const granaryElement = document.querySelector('[data-building="Granary"]');
    if (granaryElement) {
        granaryElement.style.display = villageGame.buildings.Granary.unlocked ? 'block' : 'none';
    }
    
    // Update Lumberyard owned count
    const lumberyardOwnedElement = document.querySelector('[data-building="Lumberyard"] .building-owned');
    if (lumberyardOwnedElement) {
        lumberyardOwnedElement.textContent = `Owned: ${villageGame.buildings.Lumberyard.owned}`;
    }
    
    // Update Lumberyard cost
    const lumberyardCostElement = document.querySelector('[data-building="Lumberyard"] .building-cost');
    if (lumberyardCostElement) {
        const cost = villageGame.buildings.Lumberyard.cost.wood;
        lumberyardCostElement.textContent = `Cost: ${cost} Wood`;
    }
    
    // Show/hide Lumberyard based on unlock status
    const lumberyardElement = document.querySelector('[data-building="Lumberyard"]');
    if (lumberyardElement) {
        lumberyardElement.style.display = villageGame.buildings.Lumberyard.unlocked ? 'block' : 'none';
    }
    
    // Update Herb Garden owned count
    const herbGardenOwnedElement = document.querySelector('[data-building="HerbGarden"] .building-owned');
    if (herbGardenOwnedElement) {
        herbGardenOwnedElement.textContent = `Owned: ${villageGame.buildings.HerbGarden.owned}`;
    }
    
    // Update Herb Garden cost
    const herbGardenCostElement = document.querySelector('[data-building="HerbGarden"] .building-cost');
    if (herbGardenCostElement) {
        const woodCost = villageGame.buildings.HerbGarden.cost.wood;
        const herbsCost = villageGame.buildings.HerbGarden.cost.herbs;
        herbGardenCostElement.textContent = `Cost: ${woodCost} Wood, ${herbsCost} Herbs`;
    }
    
    // Show/hide Herb Garden based on unlock status
    const herbGardenElement = document.querySelector('[data-building="HerbGarden"]');
    if (herbGardenElement) {
        herbGardenElement.style.display = villageGame.buildings.HerbGarden.unlocked ? 'block' : 'none';
    }
}

// Update job displays
function updateJobDisplays() {
    // Update farmer display
    const farmerElement = document.querySelector('[data-job="Farmer"]');
    if (farmerElement) {
        // Update owned count
        const farmerOwnedElement = farmerElement.querySelector('.building-owned');
        if (farmerOwnedElement) {
            farmerOwnedElement.textContent = `Assigned: ${villageGame.jobs.Farmer.owned}`;
        }
    }
    
    // Update woodcutter display
    const woodcutterElement = document.querySelector('[data-job="Woodcutter"]');
    if (woodcutterElement) {
        // Update owned count
        const woodcutterOwnedElement = woodcutterElement.querySelector('.building-owned');
        if (woodcutterOwnedElement) {
            woodcutterOwnedElement.textContent = `Assigned: ${villageGame.jobs.Woodcutter.owned}`;
        }
    }
    
    // Update herbalist display
    const herbalistElement = document.querySelector('[data-job="Herbalist"]');
    if (herbalistElement) {
        // Update owned count
        const herbalistOwnedElement = herbalistElement.querySelector('.building-owned');
        if (herbalistOwnedElement) {
            herbalistOwnedElement.textContent = `Assigned: ${villageGame.jobs.Herbalist.owned}`;
        }
    }
    
    // Update explorer display
    const explorerElement = document.querySelector('[data-job="Explorer"]');
    if (explorerElement) {
        // Update owned count
        const explorerOwnedElement = explorerElement.querySelector('.building-owned');
        if (explorerOwnedElement) {
            explorerOwnedElement.textContent = `Assigned: ${villageGame.jobs.Explorer.owned}`;
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
                immigrationRate = 0.1 * villageGame.buildings.Campfire.owned;
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

// debugAddResource function is now in js/resources.js

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
window.debugAddResource = debugAddResource;
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
    
    // Final morale = base morale + work time bonus, capped at 150%
    villageGame.global.morale = Math.min(150, baseMorale + workTimeBonus);
    
    // Update morale display
    const moraleValueElement = document.getElementById('moraleValue');
    if (moraleValueElement) {
        moraleValueElement.textContent = Math.round(villageGame.global.morale);
    }
    
    console.log("Morale updated to:", Math.round(villageGame.global.morale) + "% (Population:", currentPopulation + ", Work Time:", workTime + "%)");
}

// Update city type display
function updateCityType(cityType) {
    const cityTypeElement = document.getElementById('cityType');
    if (cityTypeElement) {
        cityTypeElement.textContent = cityType;
    }
}

// ============================================
// SAVE/LOAD SYSTEM
// ============================================

// Save game state
function save(exportMode) {
    const saveData = {
        version: 1,
        timestamp: Date.now(),
        resources: villageGame.resources,
        buildings: villageGame.buildings,
        jobs: villageGame.jobs,
        global: villageGame.global,
        map: villageGame.map
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

    console.log('UI state restored from save');
}
