// The Village - Population Management
// Contains all population-related functions including attraction, birth/death, morale, and work time

// Handle peasant attraction from campfires
function handlePeasantAttraction() {
    if (villageGame.buildings.Campfire.owned === 0) return;

    // Only work if campfire is active (has wood to burn)
    if (!villageGame.global.campfireActive) return;

    // Check if we're at the peasant cap
    if (villageGame.resources.peasants.owned >= villageGame.resources.peasants.max) {
        // At cap - reset accumulator
        villageGame.global.campfireAccumulator = 0;
        return;
    }

    // Calculate immigration rate with upgrade bonus and prestige bonus
    const upgradeBonus = villageGame.global.upgradeBonus || {};
    const immigrationBonus = 1 + (upgradeBonus.immigrationRate || 0);
    const prestigeImmigrationBonus = 1 + (typeof getPrestigeImmigrationBonus === 'function' ? getPrestigeImmigrationBonus() : 0);
    const baseRate = 0.1 * villageGame.buildings.Campfire.owned; // 0.1 per second per campfire

    // Add to campfire accumulator with bonus applied
    villageGame.global.campfireAccumulator += (baseRate * immigrationBonus * prestigeImmigrationBonus) / villageGame.settings.speed;
    
    // Check if we've accumulated enough for a whole peasant
    if (villageGame.global.campfireAccumulator >= 1.0) {
        // Check if we have food - no food means no immigration
        if (villageGame.resources.food.owned <= 0) {
            addMessage("A shadowy figure approaches your campfire but turns away, muttering about the lack of food. They decide to take their chances in the dark woods instead.", "Villagers");
            villageGame.global.campfireAccumulator = 0; // Reset to prevent spam
            return;
        }
        
        // Add peasant
        villageGame.resources.peasants.owned += 1;
        
        // Check for population milestones
        checkPopulationMilestones();
        
        // Update morale based on new population
        updateMorale();
        
        // Reset accumulator (keep any remainder)
        villageGame.global.campfireAccumulator -= 1.0;
        
        // First peasant story and job unlock
        if (villageGame.resources.peasants.owned === 1) {
            addMessage("A weary stranger emerges from the darkness, drawn by the warm glow of your campfire. They introduce themselves as a peasant seeking shelter and offer to help with your settlement.", "Villagers");
            
            // Unlock jobs when first peasant arrives
            if (!villageGame.global.jobsUnlocked) {
                villageGame.global.jobsUnlocked = true;
                villageGame.jobs.Farmer.unlocked = true;
                villageGame.jobs.Woodcutter.unlocked = true;
                
                // Show job unlock message
                addMessage("With your first villager, you realize you can now assign them to work. You can put them to work farming food or chopping wood to help your settlement grow.", "Story");
                addMessage("Jobs Unlocked", "Unlock");
                
                // Show job elements in UI
                const farmerElement = document.querySelector('[data-job="Farmer"]');
                const woodcutterElement = document.querySelector('[data-job="Woodcutter"]');
                if (farmerElement) farmerElement.style.display = 'block';
                if (woodcutterElement) woodcutterElement.style.display = 'block';
                
                // Update building filter to show jobs
                if (typeof window.filterBuildingItems === 'function') {
                    window.filterBuildingItems('all');
                }
            }
        } else {
            addMessage("Another peasant arrives, attracted by the light and warmth of your campfire.", "Villagers");
        }
        
        // Update peasant display
        updateResourceDisplay('peasants');
    }
}

// Handle passive resource generation from jobs
function handleJobProduction() {
    const workEfficiency = villageGame.global.workTimePercentage / 100; // Convert percentage to decimal
    const moraleEfficiency = villageGame.global.morale / 100; // Convert morale to efficiency (0-1)
    const workshopBonus = 1 + (villageGame.global.workshopBonus || 0); // Workshop production bonus
    const upgradeBonus = villageGame.global.upgradeBonus || {}; // Upgrade bonuses
    const allProductionBonus = 1 + (upgradeBonus.allProduction || 0); // All production upgrade bonus
    const prestigeProductionBonus = 1 + (typeof getPrestigeProductionBonus === 'function' ? getPrestigeProductionBonus() : 0); // Prestige production bonus

    for (let jobName in villageGame.jobs) {
        const job = villageGame.jobs[jobName];
        if (job.owned > 0) {
            // Skip jobs that don't produce resources (exploration, combat)
            if (job.resource === 'exploration' || job.resource === 'combat') {
                continue;
            }

            // Check if the resource exists
            if (!villageGame.resources[job.resource]) {
                continue;
            }

            // Calculate job-specific upgrade bonus
            let jobUpgradeBonus = 1;
            switch (jobName) {
                case 'Farmer':
                    jobUpgradeBonus = 1 + (upgradeBonus.farmerProduction || 0);
                    break;
                case 'Woodcutter':
                    jobUpgradeBonus = 1 + (upgradeBonus.woodcutterProduction || 0);
                    break;
                case 'Herbalist':
                    jobUpgradeBonus = 1 + (upgradeBonus.herbalistProduction || 0);
                    break;
                case 'Miner':
                    jobUpgradeBonus = 1 + (upgradeBonus.minerProduction || 0);
                    break;
                case 'Scholar':
                    jobUpgradeBonus = 1 + (upgradeBonus.scholarProduction || 0);
                    break;
                case 'Merchant':
                    jobUpgradeBonus = 1 + (upgradeBonus.merchantProduction || 0);
                    break;
            }

            // Production is affected by work time, morale, workshop bonus, upgrade bonuses, and prestige bonus
            const production = (job.owned * job.effectValue * workEfficiency * moraleEfficiency * workshopBonus * allProductionBonus * jobUpgradeBonus * prestigeProductionBonus) / villageGame.settings.speed;
            villageGame.resources[job.resource].owned += production;

            // Check max limits
            if (villageGame.resources[job.resource].max > 0 &&
                villageGame.resources[job.resource].owned > villageGame.resources[job.resource].max) {
                villageGame.resources[job.resource].owned = villageGame.resources[job.resource].max;
            }

            // Check for building unlocks
            checkResourceUnlocks(job.resource);

            // Update display
            updateResourceDisplay(job.resource);
        }
    }
}

// Check for population milestones and trigger storylines
function checkPopulationMilestones() {
    const currentPopulation = Math.floor(villageGame.resources.peasants.owned);
    
    // Check for population 10 milestone
    if (currentPopulation >= 10 && !villageGame.global.population10StoryTriggered) {
        villageGame.global.population10StoryTriggered = true;
        addMessage("As your village grows to 10 people, the peasants begin to grumble about sleeping on the hard ground. 'We can't keep sleeping under the stars forever,' one of them says. 'We need proper shelter!' The idea of building wooden huts begins to take shape in your mind.", "Story");
        addMessage("Wooden Hut Unlocked", "Unlock");
        
        // Unlock Wooden Hut building
        villageGame.buildings.WoodenHut.unlocked = true;
        const woodenHutElement = document.querySelector('[data-building="WoodenHut"]');
        if (woodenHutElement) {
            woodenHutElement.style.display = 'block';
        }
    }
    
    // Check for population 30 milestone - explorer job and expedition panel
    if (currentPopulation >= 30 && !villageGame.global.explorerUnlocked) {
        villageGame.global.explorerUnlocked = true;
        villageGame.global.expeditionUnlocked = true;
        addMessage("As your village reaches 30 people, the villagers begin to wonder what lies beyond the familiar forest. 'There must be more to this world than what we can see from here,' they say. 'We should send someone to explore the unknown lands!'", "Story");
        addMessage("Explorer Job Unlocked", "Unlock");
        addMessage("Expedition Panel Unlocked", "Unlock");

        // Unlock Explorer job
        villageGame.jobs.Explorer.unlocked = true;

        // Show explorer job in UI
        const explorerElement = document.querySelector('[data-job="Explorer"]');
        if (explorerElement) {
            explorerElement.style.display = 'block';
        }

        // Show expedition panel
        const expeditionPanel = document.getElementById('expeditionPanel');
        if (expeditionPanel) {
            expeditionPanel.style.display = 'block';
        }

        // Update building filter to show jobs
        if (typeof window.filterBuildingItems === 'function') {
            window.filterBuildingItems('all');
        }
    }

    // Check for population 40 milestone - Quarry unlock
    if (currentPopulation >= 40 && !villageGame.global.quarryUnlocked) {
        villageGame.global.quarryUnlocked = true;
        villageGame.buildings.Quarry.unlocked = true;
        addMessage("With your growing population, the villagers realize they need stronger materials for construction. 'We should dig into the nearby hills for stone,' suggests an elder. The idea of building a quarry takes hold.", "Story");
        addMessage("Quarry Unlocked", "Unlock");

        // Show stone resource
        showResource('metal');

        const quarryElement = document.querySelector('[data-building="Quarry"]');
        if (quarryElement) {
            quarryElement.style.display = 'block';
        }
    }

    // Check for population 50 milestone - Workshop unlock
    if (currentPopulation >= 50 && !villageGame.global.workshopUnlocked) {
        villageGame.global.workshopUnlocked = true;
        villageGame.buildings.Workshop.unlocked = true;
        addMessage("As your village grows to 50 people, skilled craftsmen emerge among your population. 'We could improve our tools and techniques,' they suggest. 'A proper workshop would make everyone more productive!'", "Story");
        addMessage("Workshop Unlocked", "Unlock");

        const workshopElement = document.querySelector('[data-building="Workshop"]');
        if (workshopElement) {
            workshopElement.style.display = 'block';
        }
    }

    // Check for population 75 milestone - Library unlock
    if (currentPopulation >= 75 && !villageGame.global.libraryUnlocked) {
        villageGame.global.libraryUnlocked = true;
        villageGame.buildings.Library.unlocked = true;
        addMessage("Your thriving village of 75 souls begins to seek wisdom beyond mere survival. 'Knowledge is power,' declares a traveling sage. 'Build a library, and your people will grow wise.'", "Story");
        addMessage("Library Unlocked", "Unlock");

        // Show knowledge resource
        showResource('science');

        const libraryElement = document.querySelector('[data-building="Library"]');
        if (libraryElement) {
            libraryElement.style.display = 'block';
        }
    }

    // Check for population 100 milestone - Market unlock
    if (currentPopulation >= 100 && !villageGame.global.marketUnlocked) {
        villageGame.global.marketUnlocked = true;
        villageGame.buildings.Market.unlocked = true;
        addMessage("With 100 people now calling your village home, the need for organized trade becomes apparent. Merchants from distant lands have heard of your prosperity and wish to establish trade routes.", "Story");
        addMessage("Market Unlocked", "Unlock");

        // Show gold resource
        showResource('gems');

        const marketElement = document.querySelector('[data-building="Market"]');
        if (marketElement) {
            marketElement.style.display = 'block';
        }
    }

    // Check for population 150 milestone - Temple unlock
    if (currentPopulation >= 150 && !villageGame.global.templeUnlocked) {
        villageGame.global.templeUnlocked = true;
        villageGame.buildings.Temple.unlocked = true;
        addMessage("Your great village of 150 people seeks spiritual guidance. The elders gather and speak of building a temple to the gods, hoping to bring blessings upon the community.", "Story");
        addMessage("Temple Unlocked", "Unlock");

        const templeElement = document.querySelector('[data-building="Temple"]');
        if (templeElement) {
            templeElement.style.display = 'block';
        }
    }
}

// Handle peasant food consumption
function handlePeasantFoodConsumption() {
    const totalPeasants = villageGame.resources.peasants.owned;
    if (totalPeasants > 0) {
        const foodConsumption = (totalPeasants * 0.5) / villageGame.settings.speed; // 0.5 food per second per peasant
        villageGame.resources.food.owned -= foodConsumption;
        
        // Don't go below 0
        if (villageGame.resources.food.owned < 0) {
            villageGame.resources.food.owned = 0;
        }
        
        console.log("Food consumption:", foodConsumption, "Food owned:", villageGame.resources.food.owned);
        
        // Update food display
        updateResourceDisplay('food');
    }
}

// Handle peasant birth rate
function handlePeasantBirthRate() {
    // Calculate unemployed peasants using integer peasant count
    // Count all employed peasants dynamically
    let totalEmployed = 0;
    for (let jobKey in villageGame.jobs) {
        totalEmployed += villageGame.jobs[jobKey].owned || 0;
    }
    totalEmployed += villageGame.global.expeditionPartySize || 0;
    const totalPeasants = Math.floor(villageGame.resources.peasants.owned);
    const unemployed = totalPeasants - totalEmployed;
    
    if (unemployed > 0 && totalPeasants < villageGame.resources.peasants.max) {
        // Calculate free time percentage (100 - work time)
        const freeTimePercentage = 100 - villageGame.global.workTimePercentage;
        const freeTimeEfficiency = freeTimePercentage / 100;
        
        // Birth rate: 0.1 per second at 100% free time, scaled by free time efficiency
        const birthRate = (0.1 * freeTimeEfficiency) / villageGame.settings.speed;
        
        // Add to birth accumulator
        villageGame.global.birthAccumulator += birthRate;
        
        // Check if we've accumulated enough for a whole peasant
        if (villageGame.global.birthAccumulator >= 1.0) {
            // Add peasant
            villageGame.resources.peasants.owned += 1;
            
            // Check for first child born
            if (!villageGame.global.firstChildBorn) {
                villageGame.global.firstChildBorn = true;
                villageGame.global.birthRateUnlocked = true;
                
                // Show birth rate display
                const birthRateElement = document.getElementById('birthRate');
                if (birthRateElement) {
                    birthRateElement.style.display = 'block';
                }
                
                addMessage("The first child has been born in your village! This marks a new era of growth and prosperity.", "Story");
                addMessage("Birth Rate Unlocked", "Unlock");
            } else {
                addMessage("A new child has been born in your village!", "Villagers");
            }
            
            // Reset accumulator (keep any remainder)
            villageGame.global.birthAccumulator -= 1.0;
            
            // Check for population milestones
            checkPopulationMilestones();
            
            // Update morale based on new population
            updateMorale();
            
            // Update peasant display
            updateResourceDisplay('peasants');
        }
    } else {
        // No unemployed peasants or at cap - reset accumulator
        villageGame.global.birthAccumulator = 0;
    }
}

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
                const prestigeImmigrationBonus = 1 + (typeof getPrestigeImmigrationBonus === 'function' ? getPrestigeImmigrationBonus() : 0);
                immigrationRate = 0.1 * villageGame.buildings.Campfire.owned * immigrationBonus * prestigeImmigrationBonus;
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
            // Count all employed peasants dynamically
            let totalEmployed = 0;
            for (let jobKey in villageGame.jobs) {
                totalEmployed += villageGame.jobs[jobKey].owned || 0;
            }
            totalEmployed += villageGame.global.expeditionPartySize || 0;
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

    // Temple bonus: each temple adds 15% to morale
    const templeBonus = villageGame.global.templeBonus || 0;

    // Final morale = base morale + work time bonus + temple bonus, capped at 200%
    villageGame.global.morale = Math.min(200, baseMorale + workTimeBonus + templeBonus);

    // Update morale display
    const moraleValueElement = document.getElementById('moraleValue');
    if (moraleValueElement) {
        moraleValueElement.textContent = Math.round(villageGame.global.morale);
    }

    console.log("Morale updated to:", Math.round(villageGame.global.morale) + "% (Population:", currentPopulation + ", Work Time:", workTime + "%, Temple:", templeBonus + "%)");
}




