// The Village - Resource Management
// Contains all resource gathering, display, and management functions

// Resource gathering function for our village game
function setGather(what, updateOnly) {
    if (updateOnly) return;
    
    // Stop current gathering
    if (villageGame.global.playerGathering !== "") {
        // Find the current button by looking for the resource card and its button
        const currentResourceCard = document.querySelector(`[data-resource="${villageGame.global.playerGathering}"]`);
        if (currentResourceCard) {
            const currentBtn = currentResourceCard.querySelector('.resource-button');
            if (currentBtn) {
                currentBtn.innerHTML = getGatherButtonText(villageGame.global.playerGathering, false);
                currentBtn.style.background = 'linear-gradient(145deg, #3182ce, #2c5282)';
            }
        }
    }
    
    // Start new gathering
    villageGame.global.playerGathering = what;
    const newResourceCard = document.querySelector(`[data-resource="${what}"]`);
    if (newResourceCard) {
        const newBtn = newResourceCard.querySelector('.resource-button');
        if (newBtn) {
            newBtn.innerHTML = getGatherButtonText(what, true);
            newBtn.style.background = 'linear-gradient(145deg, #38a169, #2f855a)';
        }
    }
    
    // Update per-second displays to reflect gathering changes
    updateResourcePerSecondDisplays();
    
    console.log("Now gathering:", what);
}

// Get the correct button text for gathering
function getGatherButtonText(what, isGathering) {
    switch (what) {
        case "food":
            return isGathering ? "Gathering" : "Gather";
        case "wood":
            return isGathering ? "Chopping" : "Chop";
        case "metal":
            return isGathering ? "Mining" : "Mine";
        case "science":
            return isGathering ? "Studying" : "Study";
        case "herbs":
            return isGathering ? "Foraging" : "Forage";
        case "iron":
            return isGathering ? "Smelting" : "Smelt";
        case "peasants":
            return isGathering ? "Recruiting" : "Recruit";
        default:
            return isGathering ? "Working" : "Work";
    }
}

// Simple resource gathering function
function gatherResources() {
    const what = villageGame.global.playerGathering;

    // Base gathering rate with upgrade bonus and prestige bonus
    const upgradeBonus = villageGame.global.upgradeBonus || {};
    const gatheringSpeedBonus = 1 + (upgradeBonus.gatheringSpeed || 0);
    const prestigeProductionBonus = 1 + (typeof getPrestigeProductionBonus === 'function' ? getPrestigeProductionBonus() : 0);
    let amount = (1 * gatheringSpeedBonus * prestigeProductionBonus) / villageGame.settings.speed; // 1 resource per second * bonus

    // Add resources if gathering
    if (what && villageGame.resources[what]) {
        villageGame.resources[what].owned += amount;
        
        // Check max limits
        if (villageGame.resources[what].max > 0 && 
            villageGame.resources[what].owned > villageGame.resources[what].max) {
            villageGame.resources[what].owned = villageGame.resources[what].max;
        }
        
        // Check for building unlocks
        checkResourceUnlocks(what);
        
        // Update display
        updateResourceDisplay(what);
    }
    
    // Handle wood consumption from buildings (only if wood is available)
    if (villageGame.global.woodConsumption > 0) {
        if (villageGame.resources.wood.owned > 0) {
            // Campfire is burning
            if (!villageGame.global.campfireActive) {
                villageGame.global.campfireActive = true;
                addMessage("The campfire flickers back to life as you add more wood to the flames.", "Story");
            }
            
            const woodConsumption = villageGame.global.woodConsumption / villageGame.settings.speed;
            villageGame.resources.wood.owned -= woodConsumption;
            
            // Don't go below 0
            if (villageGame.resources.wood.owned < 0) {
                villageGame.resources.wood.owned = 0;
            }
            
            // Update wood display
            updateResourceDisplay('wood');
        } else {
            // No wood - campfire goes out
            if (villageGame.global.campfireActive) {
                villageGame.global.campfireActive = false;
                addMessage("The campfire sputters and dies as the last embers burn out. The darkness creeps back in.", "Story");
            }
        }
    }
    
    // Handle peasant attraction from campfires (only if wood is available)
    handlePeasantAttraction();
    
    // Handle passive resource generation from jobs
    handleJobProduction();
    
    // Handle peasant food consumption
    handlePeasantFoodConsumption();
    
    // Handle peasant birth rate
    handlePeasantBirthRate();
    
    // Handle peasant death rate
    handlePeasantDeathRate();
    
    // Handle exploration
    handleExploration();
    
    // Update job displays to keep unemployed count current
    updateJobDisplays();
    
    // Update per-second displays every few ticks to keep them current
    if (Math.floor(Date.now() / 100) % 2 === 0) { // Update every 0.2 seconds
        updateResourcePerSecondDisplays();
    }
}

// Check for building unlocks based on resource milestones
function checkResourceUnlocks(resourceType) {
    // Check for Granary unlock (100 food)
    if (resourceType === 'food' && 
        villageGame.resources.food.owned >= 100 && 
        !villageGame.global.granaryUnlocked) {
        
        villageGame.global.granaryUnlocked = true;
        villageGame.buildings.Granary.unlocked = true;
        
        // Show granary in UI
        const granaryElement = document.querySelector('[data-building="Granary"]');
        if (granaryElement) {
            granaryElement.style.display = 'block';
        }
        
        addMessage("With your growing food stores, you realize you need a proper place to store and preserve your harvest. The idea of a granary comes to mind!", "Story");
        addMessage("Granary Unlocked", "Unlock");
    }
    
    // Check for Lumberyard unlock (100 wood)
    if (resourceType === 'wood' && 
        villageGame.resources.wood.owned >= 100 && 
        !villageGame.global.lumberyardUnlocked) {
        
        villageGame.global.lumberyardUnlocked = true;
        villageGame.buildings.Lumberyard.unlocked = true;
        
        // Show lumberyard in UI
        const lumberyardElement = document.querySelector('[data-building="Lumberyard"]');
        if (lumberyardElement) {
            lumberyardElement.style.display = 'block';
        }
        
        addMessage("As your wood stockpile grows, you realize you need a dedicated space to process and store lumber. The concept of a lumberyard emerges!", "Story");
        addMessage("Lumberyard Unlocked", "Unlock");
    }
    
    // Check for Herb Garden unlock (50 herbs)
    if (resourceType === 'herbs' && 
        villageGame.resources.herbs.owned >= 50 && 
        !villageGame.global.herbGardenUnlocked) {
        
        villageGame.global.herbGardenUnlocked = true;
        villageGame.buildings.HerbGarden.unlocked = true;
        
        // Show herb garden in UI
        const herbGardenElement = document.querySelector('[data-building="HerbGarden"]');
        if (herbGardenElement) {
            herbGardenElement.style.display = 'block';
        }
        
        addMessage("With your growing collection of medicinal herbs, you realize you need a proper place to cultivate and store them. The idea of a herb garden comes to mind!", "Story");
        addMessage("Herb Garden Unlocked", "Unlock");
    }
}

// Update the display for a specific resource
function updateResourceDisplay(what) {
    const resource = villageGame.resources[what];
    if (!resource) return;
    
    // Special handling for peasants - they don't have a resource card
    if (what === 'peasants') {
        updatePeoplePanelDisplays();
        return;
    }
    
    // Find the resource card
    const resourceCard = document.querySelector(`[data-resource="${what}"]`);
    if (!resourceCard) return;
    
    // Update owned amount
    const ownedElement = resourceCard.querySelector('.resource-value');
    if (ownedElement) {
        ownedElement.textContent = Math.floor(resource.owned);
    }
    
    // Update max amount (if applicable)
    if (resource.max > 0) {
        const maxElement = resourceCard.querySelector('.resource-max');
        if (maxElement) {
            maxElement.textContent = `/ ${resource.max}`;
        }
        
        // Update progress bar
        const progressBar = resourceCard.querySelector('.resource-progress-fill');
        if (progressBar) {
            const percentage = (resource.owned / resource.max) * 100;
            progressBar.style.width = percentage + "%";
        }
    } else {
        // For unlimited resources, hide the max display
        const maxElement = resourceCard.querySelector('.resource-max');
        if (maxElement) {
            maxElement.textContent = '';
        }
        
        // Hide progress bar for unlimited resources
        const progressBar = resourceCard.querySelector('.resource-progress-fill');
        if (progressBar) {
            progressBar.style.width = "0%";
        }
    }
    
    // Per second display is handled by updateResourcePerSecondDisplays()
}

// Update resource per second displays
function updateResourcePerSecondDisplays() {
    // Shared efficiency calculations
    const workEfficiency = villageGame.global.workTimePercentage / 100;
    const moraleEfficiency = villageGame.global.morale / 100;
    const workshopBonus = 1 + (villageGame.global.workshopBonus || 0);

    // Upgrade bonuses
    const upgradeBonus = villageGame.global.upgradeBonus || {};
    const allProductionBonus = 1 + (upgradeBonus.allProduction || 0);
    const gatheringSpeedBonus = 1 + (upgradeBonus.gatheringSpeed || 0);

    // Prestige production bonus
    const prestigeProductionBonus = 1 + (typeof getPrestigeProductionBonus === 'function' ? getPrestigeProductionBonus() : 0);

    // Helper function to format rate display
    function formatRate(rate) {
        if (rate > 0) {
            return `+${rate.toFixed(1)}/sec`;
        } else if (rate < 0) {
            return `${rate.toFixed(1)}/sec`;
        } else {
            return `+0.0/sec`;
        }
    }

    // Helper function to get job-specific upgrade bonus
    function getJobUpgradeBonus(jobName) {
        switch (jobName) {
            case 'Farmer':
                return 1 + (upgradeBonus.farmerProduction || 0);
            case 'Woodcutter':
                return 1 + (upgradeBonus.woodcutterProduction || 0);
            case 'Herbalist':
                return 1 + (upgradeBonus.herbalistProduction || 0);
            case 'Miner':
                return 1 + (upgradeBonus.minerProduction || 0);
            case 'Scholar':
                return 1 + (upgradeBonus.scholarProduction || 0);
            case 'Merchant':
                return 1 + (upgradeBonus.merchantProduction || 0);
            default:
                return 1;
        }
    }

    // Update food per second
    const foodCard = document.querySelector('[data-resource="food"]');
    if (foodCard) {
        const foodPsElement = foodCard.querySelector('.resource-rate');
        if (foodPsElement) {
            let foodPerSec = 0;
            if (villageGame.global.playerGathering === 'food') foodPerSec += 1 * gatheringSpeedBonus * prestigeProductionBonus;

            // Apply work time efficiency, morale, workshop bonus, upgrade bonuses, and prestige bonus to farmer production
            const farmerBonus = getJobUpgradeBonus('Farmer');
            foodPerSec += villageGame.jobs.Farmer.owned * villageGame.jobs.Farmer.effectValue * workEfficiency * moraleEfficiency * workshopBonus * allProductionBonus * farmerBonus * prestigeProductionBonus;

            // Subtract peasant food consumption
            const totalPeasants = villageGame.resources.peasants.owned;
            foodPerSec -= totalPeasants * 0.5; // 0.5 food per second per peasant

            foodPsElement.textContent = formatRate(foodPerSec);
        }
    }

    // Update wood per second
    const woodCard = document.querySelector('[data-resource="wood"]');
    if (woodCard) {
        const woodPsElement = woodCard.querySelector('.resource-rate');
        if (woodPsElement) {
            let woodPerSec = 0;
            if (villageGame.global.playerGathering === 'wood') woodPerSec += 1 * gatheringSpeedBonus * prestigeProductionBonus;

            // Apply work time efficiency, morale, workshop bonus, upgrade bonuses, and prestige bonus to woodcutter production
            const woodcutterBonus = getJobUpgradeBonus('Woodcutter');
            woodPerSec += villageGame.jobs.Woodcutter.owned * villageGame.jobs.Woodcutter.effectValue * workEfficiency * moraleEfficiency * workshopBonus * allProductionBonus * woodcutterBonus * prestigeProductionBonus;

            // Subtract campfire consumption
            if (villageGame.global.woodConsumption > 0 && villageGame.global.campfireActive) {
                woodPerSec -= villageGame.global.woodConsumption;
            }

            woodPsElement.textContent = formatRate(woodPerSec);
        }
    }

    // Update herbs per second
    const herbsCard = document.querySelector('[data-resource="herbs"]');
    if (herbsCard) {
        const herbsPsElement = herbsCard.querySelector('.resource-rate');
        if (herbsPsElement) {
            let herbsPerSec = 0;
            if (villageGame.global.playerGathering === 'herbs') herbsPerSec += 1 * gatheringSpeedBonus * prestigeProductionBonus;

            // Apply work time efficiency, morale, workshop bonus, upgrade bonuses, and prestige bonus to herbalist production
            const herbalistBonus = getJobUpgradeBonus('Herbalist');
            herbsPerSec += villageGame.jobs.Herbalist.owned * villageGame.jobs.Herbalist.effectValue * workEfficiency * moraleEfficiency * workshopBonus * allProductionBonus * herbalistBonus * prestigeProductionBonus;

            herbsPsElement.textContent = formatRate(herbsPerSec);
        }
    }

    // Update iron per second
    const ironCard = document.querySelector('[data-resource="iron"]');
    if (ironCard) {
        const ironPsElement = ironCard.querySelector('.resource-rate');
        if (ironPsElement) {
            let ironPerSec = 0;
            if (villageGame.global.playerGathering === 'iron') ironPerSec += 1 * gatheringSpeedBonus * prestigeProductionBonus;

            ironPsElement.textContent = formatRate(ironPerSec);
        }
    }

    // Update metal per second (stone from Miners)
    const metalCard = document.querySelector('[data-resource="metal"]');
    if (metalCard) {
        const metalPsElement = metalCard.querySelector('.resource-rate');
        if (metalPsElement) {
            let metalPerSec = 0;
            if (villageGame.global.playerGathering === 'metal') metalPerSec += 1 * gatheringSpeedBonus * prestigeProductionBonus;

            // Add Miner production with workshop bonus, upgrade bonuses, and prestige bonus
            if (villageGame.jobs.Miner) {
                const minerBonus = getJobUpgradeBonus('Miner');
                metalPerSec += villageGame.jobs.Miner.owned * villageGame.jobs.Miner.effectValue * workEfficiency * moraleEfficiency * workshopBonus * allProductionBonus * minerBonus * prestigeProductionBonus;
            }

            metalPsElement.textContent = formatRate(metalPerSec);
        }
    }

    // Update science per second (knowledge from Scholars)
    const scienceCard = document.querySelector('[data-resource="science"]');
    if (scienceCard) {
        const sciencePsElement = scienceCard.querySelector('.resource-rate');
        if (sciencePsElement) {
            let sciencePerSec = 0;
            if (villageGame.global.playerGathering === 'science') sciencePerSec += 1 * gatheringSpeedBonus * prestigeProductionBonus;

            // Add Scholar production with workshop bonus, upgrade bonuses, and prestige bonus
            if (villageGame.jobs.Scholar) {
                const scholarBonus = getJobUpgradeBonus('Scholar');
                sciencePerSec += villageGame.jobs.Scholar.owned * villageGame.jobs.Scholar.effectValue * workEfficiency * moraleEfficiency * workshopBonus * allProductionBonus * scholarBonus * prestigeProductionBonus;
            }

            sciencePsElement.textContent = formatRate(sciencePerSec);
        }
    }

    // Update gems per second (gold from Merchants)
    const gemsCard = document.querySelector('[data-resource="gems"]');
    if (gemsCard) {
        const gemsPsElement = gemsCard.querySelector('.resource-rate');
        if (gemsPsElement) {
            let gemsPerSec = 0;
            if (villageGame.global.playerGathering === 'gems') gemsPerSec += 1 * gatheringSpeedBonus * prestigeProductionBonus;

            // Add Merchant production with workshop bonus, upgrade bonuses, and prestige bonus
            if (villageGame.jobs.Merchant) {
                const merchantBonus = getJobUpgradeBonus('Merchant');
                gemsPerSec += villageGame.jobs.Merchant.owned * villageGame.jobs.Merchant.effectValue * workEfficiency * moraleEfficiency * workshopBonus * allProductionBonus * merchantBonus * prestigeProductionBonus;
            }

            gemsPsElement.textContent = formatRate(gemsPerSec);
        }
    }
}

// Function to show hidden resource cards
function showResource(resourceName) {
    const resourceCard = document.getElementById(resourceName + 'Card');
    if (resourceCard) {
        resourceCard.style.display = 'block';
    }
}

// Debug functions for testing
function debugAddResource(resourceName, amount = 100) {
    if (villageGame.resources[resourceName]) {
        villageGame.resources[resourceName].owned += amount;
        updateResourceDisplay(resourceName);
        addMessage(`Debug: Added ${amount} ${resourceName}`, "Loot");
    }
}




