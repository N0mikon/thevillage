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
    } else if (buildingName === 'Quarry') {
        // Increase stone storage capacity by 100
        villageGame.resources.metal.max += building.effectValue;

        // First quarry unlocks Miner job
        if (building.owned === 1) {
            villageGame.jobs.Miner.unlocked = true;
            addMessage("The quarry begins operations, revealing veins of stone in the hillside. Workers with strong arms step forward, eager to become miners.", "Construction");
            addMessage("Miner Job Unlocked", "Unlock");

            const minerElement = document.querySelector('[data-job="Miner"]');
            if (minerElement) {
                minerElement.style.display = 'block';
            }
        }
    } else if (buildingName === 'Workshop') {
        // Increase production bonus by 10%
        villageGame.global.workshopBonus += building.effectValue;

        // First time story
        if (building.owned === 1) {
            addMessage("The workshop hums with activity as craftsmen sharpen tools and improve techniques. All workers in the village become more productive!", "Construction");
        }
    } else if (buildingName === 'Library') {
        // First library unlocks Scholar job
        if (building.owned === 1) {
            villageGame.jobs.Scholar.unlocked = true;
            addMessage("The library's shelves fill with scrolls and tomes. Learned individuals gather to study and share knowledge. A new path to wisdom opens.", "Construction");
            addMessage("Scholar Job Unlocked", "Unlock");

            const scholarElement = document.querySelector('[data-job="Scholar"]');
            if (scholarElement) {
                scholarElement.style.display = 'block';
            }
        }
    } else if (buildingName === 'Market') {
        // First market unlocks Merchant job
        if (building.owned === 1) {
            villageGame.jobs.Merchant.unlocked = true;
            addMessage("The marketplace bustles with activity! Traders set up stalls and merchants arrive from distant lands. Gold begins to flow into your village.", "Construction");
            addMessage("Merchant Job Unlocked", "Unlock");

            const merchantElement = document.querySelector('[data-job="Merchant"]');
            if (merchantElement) {
                merchantElement.style.display = 'block';
            }
        }
    } else if (buildingName === 'Temple') {
        // Increase morale bonus by 15%
        villageGame.global.templeBonus += building.effectValue;

        // First time story
        if (building.owned === 1) {
            addMessage("The temple rises majestically, its spire reaching toward the heavens. The villagers gather to pray and find peace. Morale throughout the village improves.", "Construction");
        }
    } else if (buildingName === 'Barracks') {
        // First barracks unlocks Soldier job
        if (building.owned === 1) {
            villageGame.jobs.Soldier.unlocked = true;
            addMessage("The barracks stands ready to train defenders. Brave villagers volunteer to become soldiers and protect the village from the monsters lurking in the wilderness.", "Construction");
            addMessage("Soldier Job Unlocked", "Unlock");

            const soldierElement = document.querySelector('[data-job="Soldier"]');
            if (soldierElement) {
                soldierElement.style.display = 'block';
            }

            // Show iron resource if not already shown
            showResource('iron');
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
            addMessage("The first soldier takes up arms to defend the village. With proper training, they will protect your people from monsters.", "Villagers");
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

    // Update Quarry
    if (villageGame.buildings.Quarry) {
        const quarryOwnedElement = document.querySelector('[data-building="Quarry"] .building-owned');
        if (quarryOwnedElement) {
            quarryOwnedElement.textContent = `Owned: ${villageGame.buildings.Quarry.owned}`;
        }
        const quarryCostElement = document.querySelector('[data-building="Quarry"] .building-cost');
        if (quarryCostElement) {
            quarryCostElement.textContent = `Cost: ${villageGame.buildings.Quarry.cost.wood} Wood, ${villageGame.buildings.Quarry.cost.food} Food`;
        }
        const quarryElement = document.querySelector('[data-building="Quarry"]');
        if (quarryElement) {
            quarryElement.style.display = villageGame.buildings.Quarry.unlocked ? 'block' : 'none';
        }
    }

    // Update Workshop
    if (villageGame.buildings.Workshop) {
        const workshopOwnedElement = document.querySelector('[data-building="Workshop"] .building-owned');
        if (workshopOwnedElement) {
            workshopOwnedElement.textContent = `Owned: ${villageGame.buildings.Workshop.owned}`;
        }
        const workshopCostElement = document.querySelector('[data-building="Workshop"] .building-cost');
        if (workshopCostElement) {
            workshopCostElement.textContent = `Cost: ${villageGame.buildings.Workshop.cost.wood} Wood, ${villageGame.buildings.Workshop.cost.metal} Stone`;
        }
        const workshopElement = document.querySelector('[data-building="Workshop"]');
        if (workshopElement) {
            workshopElement.style.display = villageGame.buildings.Workshop.unlocked ? 'block' : 'none';
        }
    }

    // Update Library
    if (villageGame.buildings.Library) {
        const libraryOwnedElement = document.querySelector('[data-building="Library"] .building-owned');
        if (libraryOwnedElement) {
            libraryOwnedElement.textContent = `Owned: ${villageGame.buildings.Library.owned}`;
        }
        const libraryCostElement = document.querySelector('[data-building="Library"] .building-cost');
        if (libraryCostElement) {
            libraryCostElement.textContent = `Cost: ${villageGame.buildings.Library.cost.wood} Wood, ${villageGame.buildings.Library.cost.metal} Stone`;
        }
        const libraryElement = document.querySelector('[data-building="Library"]');
        if (libraryElement) {
            libraryElement.style.display = villageGame.buildings.Library.unlocked ? 'block' : 'none';
        }
    }

    // Update Market
    if (villageGame.buildings.Market) {
        const marketOwnedElement = document.querySelector('[data-building="Market"] .building-owned');
        if (marketOwnedElement) {
            marketOwnedElement.textContent = `Owned: ${villageGame.buildings.Market.owned}`;
        }
        const marketCostElement = document.querySelector('[data-building="Market"] .building-cost');
        if (marketCostElement) {
            marketCostElement.textContent = `Cost: ${villageGame.buildings.Market.cost.wood} Wood, ${villageGame.buildings.Market.cost.food} Food, ${villageGame.buildings.Market.cost.metal} Stone`;
        }
        const marketElement = document.querySelector('[data-building="Market"]');
        if (marketElement) {
            marketElement.style.display = villageGame.buildings.Market.unlocked ? 'block' : 'none';
        }
    }

    // Update Temple
    if (villageGame.buildings.Temple) {
        const templeOwnedElement = document.querySelector('[data-building="Temple"] .building-owned');
        if (templeOwnedElement) {
            templeOwnedElement.textContent = `Owned: ${villageGame.buildings.Temple.owned}`;
        }
        const templeCostElement = document.querySelector('[data-building="Temple"] .building-cost');
        if (templeCostElement) {
            templeCostElement.textContent = `Cost: ${villageGame.buildings.Temple.cost.wood} Wood, ${villageGame.buildings.Temple.cost.metal} Stone, ${villageGame.buildings.Temple.cost.science} Knowledge`;
        }
        const templeElement = document.querySelector('[data-building="Temple"]');
        if (templeElement) {
            templeElement.style.display = villageGame.buildings.Temple.unlocked ? 'block' : 'none';
        }
    }

    // Update Barracks
    if (villageGame.buildings.Barracks) {
        const barracksOwnedElement = document.querySelector('[data-building="Barracks"] .building-owned');
        if (barracksOwnedElement) {
            barracksOwnedElement.textContent = `Owned: ${villageGame.buildings.Barracks.owned}`;
        }
        const barracksCostElement = document.querySelector('[data-building="Barracks"] .building-cost');
        if (barracksCostElement) {
            barracksCostElement.textContent = `Cost: ${villageGame.buildings.Barracks.cost.wood} Wood, ${villageGame.buildings.Barracks.cost.metal} Stone, ${villageGame.buildings.Barracks.cost.iron} Iron`;
        }
        const barracksElement = document.querySelector('[data-building="Barracks"]');
        if (barracksElement) {
            barracksElement.style.display = villageGame.buildings.Barracks.unlocked ? 'block' : 'none';
        }
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

    // Update miner display
    if (villageGame.jobs.Miner) {
        const minerElement = document.querySelector('[data-job="Miner"]');
        if (minerElement) {
            const minerOwnedElement = minerElement.querySelector('.building-owned');
            if (minerOwnedElement) {
                minerOwnedElement.textContent = `Assigned: ${villageGame.jobs.Miner.owned}`;
            }
        }
    }

    // Update scholar display
    if (villageGame.jobs.Scholar) {
        const scholarElement = document.querySelector('[data-job="Scholar"]');
        if (scholarElement) {
            const scholarOwnedElement = scholarElement.querySelector('.building-owned');
            if (scholarOwnedElement) {
                scholarOwnedElement.textContent = `Assigned: ${villageGame.jobs.Scholar.owned}`;
            }
        }
    }

    // Update merchant display
    if (villageGame.jobs.Merchant) {
        const merchantElement = document.querySelector('[data-job="Merchant"]');
        if (merchantElement) {
            const merchantOwnedElement = merchantElement.querySelector('.building-owned');
            if (merchantOwnedElement) {
                merchantOwnedElement.textContent = `Assigned: ${villageGame.jobs.Merchant.owned}`;
            }
        }
    }

    // Update soldier display
    if (villageGame.jobs.Soldier) {
        const soldierElement = document.querySelector('[data-job="Soldier"]');
        if (soldierElement) {
            const soldierOwnedElement = soldierElement.querySelector('.building-owned');
            if (soldierOwnedElement) {
                soldierOwnedElement.textContent = `Assigned: ${villageGame.jobs.Soldier.owned}`;
            }
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




