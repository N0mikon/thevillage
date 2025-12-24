# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The Village is a browser-based incremental/idle game inspired by Trimps. You manage a medieval peasant settlement through resource management, population growth, building construction, job assignment, and exploration. The game uses vanilla web technologies with no frameworks or external dependencies.

## Running the Game

Open `index.html` directly in a web browser. No build step, server, or installation required.

For local development with live reload, you can optionally use:
```bash
python -m http.server 8000
# or
npx serve .
```

## Architecture

### File Structure
```
thevillage/
├── index.html      # Main game UI, CSS styles, and event handlers
├── village.js      # Core game logic, initialization, game loop
├── js/
│   ├── config.js   # Game state object (villageGame), all data definitions
│   ├── resources.js # Resource gathering, display updates, unlock checks
│   ├── population.js # Birth/death rates, immigration, morale, job production
│   └── buildings.js # Building/job purchase, display updates, expeditions
└── memory-bank/    # Project documentation for AI context
```

### Game State Architecture

All game state is stored in the global `villageGame` object defined in `js/config.js`:
- `villageGame.resources` - Resource amounts and caps (food, wood, metal, science, herbs, iron, peasants)
- `villageGame.buildings` - Building ownership, costs, effects, unlock status
- `villageGame.jobs` - Job assignments and production values
- `villageGame.global` - Game flags, accumulators, and settings
- `villageGame.map` - Exploration grid state
- `villageGame.settings.speed` - Game tick rate (10 ticks/sec)

### Game Loop

The game runs on a 100ms tick interval (10 ticks/second). The main loop in `gatherResources()` (resources.js) handles:
1. Player manual gathering
2. Building upkeep (wood consumption)
3. Peasant attraction from campfires
4. Job production (affected by work time % and morale)
5. Food consumption
6. Birth/death rate calculations
7. Exploration progress
8. Display updates

### Progressive Unlock System

Content unlocks based on milestones:
- **First peasant** → Farmer and Woodcutter jobs
- **10 population** → Wooden Hut building
- **20 population** → Death system (hidden until first death)
- **10th death** → Herbalist job and Herbs resource
- **30 population** → Explorer job and Expedition panel
- **100 food/wood** → Granary/Lumberyard buildings
- **50 herbs** → Herb Garden building

### Accumulator Pattern

Population changes use accumulators to convert per-tick fractional rates into whole-number events:
- `birthAccumulator` - Tracks fractional births until ≥1.0
- `deathAccumulator` - Tracks fractional deaths until ≥1.0
- `campfireAccumulator` - Tracks immigration progress
- `explorationAccumulator` - Tracks map exploration progress

### UI Update Functions

Key display update functions (call after state changes):
- `updateAllDisplays()` - Updates everything
- `updateResourceDisplay(resourceName)` - Single resource card
- `updateResourcePerSecondDisplays()` - Production rates
- `updateBuildingDisplays()` - Building ownership and costs
- `updateJobDisplays()` - Job assignments
- `updatePeoplePanelDisplays()` - Population and rates
- `updateMapDisplay()` - Exploration grid

### Adding New Content

**New Resource:**
1. Add to `villageGame.resources` in config.js
2. Add HTML card in index.html (hidden by default if gated)
3. Add per-second update logic in `updateResourcePerSecondDisplays()`
4. Add unlock trigger in appropriate milestone check

**New Building:**
1. Add to `villageGame.buildings` in config.js with cost, effect, unlock status
2. Add HTML element in index.html buildings-container
3. Add effect application in `buyBuilding()` function
4. Add display update in `updateBuildingDisplays()`

**New Job:**
1. Add to `villageGame.jobs` in config.js with resource production
2. Add HTML element in index.html jobs-container
3. Job production is automatically handled by `handleJobProduction()` loop

## Code Patterns

### Cost Scaling
Buildings scale by 1.1x per purchase: `cost = Math.round(cost * 1.1)`

### Work/Morale Efficiency
Job production is modified by both work time and morale:
```javascript
const production = job.owned * job.effectValue * (workTimePercentage/100) * (morale/100);
```

### Message Types
Log messages use types: Story, Construction, Loot, Villagers, Combat, Unlock, Death

### Data Attribute Selectors
UI elements use data attributes for selection:
- `[data-resource="food"]` - Resource cards
- `[data-building="Campfire"]` - Building items
- `[data-job="Farmer"]` - Job items

## Trimps Reference

This game is inspired by Trimps (https://github.com/Trimps/Trimps.github.io). Key architectural similarities:
- Global game state object pattern (Trimps uses `game`, we use `villageGame`)
- Tick-based game loop with delta time
- Progressive content unlocks based on milestones
- Resource production from assigned workers
- Building effects that modify game state

Key differences from Trimps:
- Simpler codebase (~2K lines vs Trimps' ~1.5M lines)
- Native JS numbers instead of Decimal.js
- Village/medieval theme instead of Trimps' abstract setting
- No prestige system (yet)
- Population birth/death mechanics central to gameplay

## Debug Tools

The footer contains debug buttons (+100 resources, +30 peasants) for testing. These should be removed before release. Debug function: `debugAddResource(resourceName, amount)`
