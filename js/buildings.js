// The Village - Building System
// Contains all building construction, job assignment, and related UI functions

// Buy a building
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
        addMessage("An expedition is already active!", "Loot");
        return false;
    }
    
    villageGame.global.expeditionActive = true;
    
    // Update launch button
    const launchButton = document.getElementById('launchExpeditionButton');
    if (launchButton) {
        launchButton.textContent = 'Expedition Active';
        launchButton.disabled = true;
    }
    
    addMessage("Expedition launched! Your explorers begin their journey into the unknown.", "Villagers");
    return true;
}

// Update expedition displays
function updateExpeditionDisplays() {
    // Update expedition party size
    const partySizeElement = document.getElementById('expeditionPartySize');
    if (partySizeElement) {
        partySizeElement.textContent = villageGame.global.expeditionPartySize;
    }
    
    // Update expedition explorer count
    const explorerCountElement = document.getElementById('expeditionExplorerCount');
    if (explorerCountElement) {
        explorerCountElement.textContent = villageGame.jobs.Explorer.owned;
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




