# System Patterns: The Village

## System Architecture

### Core Architecture Pattern
The game follows a **modular, event-driven architecture** designed for the village theme:

```
Game State (village.js)
    ↓
Game Logic (village.js)
    ↓
UI Updates (village.js)
    ↓
User Interactions (index.html)
```

### Key Technical Decisions

#### 1. Game State Management
- **Centralized State**: Single `villageGame` object contains all game data
- **Immutable Updates**: State changes through dedicated functions
- **Native Number Handling**: JavaScript number handling for game values
- **Local Storage**: Browser-based persistence

#### 2. Update Loop Pattern
```javascript
gameTick() {
  updateResources(deltaTime)
  updatePeasants(deltaTime)
  updateBuildingsQueue(deltaTime)
  updateVillageExploration(deltaTime)
  updateAllDisplays()
}
```

#### 3. Resource System Pattern
```javascript
resources: {
  [resourceName]: {
    owned: Number,
    max: Number,
    perSec: Number,
    total: Number
  }
}
```

## Component Relationships

### Resource Flow
```
Manual Gathering → Peasant Jobs → Building Production → Upgrades → Enhanced Production
```

### Building System
```
Construction Queue → Build Time → Building Completion → Effect Application → UI Update
```

### Job Assignment
```
Peasant Recruitment → Job Assignment → Resource Production → Population Management
```

## Design Patterns in Use

### 1. Observer Pattern
- **Game State Changes**: UI automatically updates when game state changes
- **Resource Updates**: All resource displays update simultaneously
- **Event System**: User actions trigger state changes and UI updates

### 2. Factory Pattern
- **Building Creation**: Buildings are created through a standardized process
- **Job Assignment**: Jobs follow a consistent creation pattern
- **Upgrade Application**: Upgrades are applied through a uniform system

### 3. Strategy Pattern
- **Resource Generation**: Different buildings/jobs use different generation strategies
- **Cost Calculation**: Each building/job has its own cost calculation method
- **Effect Application**: Different upgrades apply effects in different ways

### 4. Command Pattern
- **User Actions**: Each user action (buy building, assign job) is a command
- **Queue System**: Building construction uses a command queue
- **Undo/Redo**: Potential for future implementation

## Data Flow Patterns

### 1. Resource Generation Flow
```
Time Tick → Calculate Production → Update Resources → Update UI → Check Caps
```

### 2. Building Construction Flow
```
User Clicks Buy → Check Affordability → Spend Resources → Add to Queue → Start Timer → Complete Building → Apply Effects
```

### 3. Job Assignment Flow
```
User Clicks Assign → Check Affordability → Check Peasant Availability → Spend Resources → Assign Peasant → Update Production
```

## System Integration Points

### 1. Resource System Integration
- **Buildings**: Consume resources, produce resources
- **Jobs**: Consume resources, produce resources
- **Upgrades**: Consume resources, enhance production
- **Exploration**: Consume resources, find resources

### 2. Population System Integration
- **Buildings**: Houses increase population capacity
- **Jobs**: Require unemployed peasants
- **Recruitment**: Consumes resources, increases population
- **Production**: Peasants generate resources through jobs

### 3. UI System Integration
- **Real-time Updates**: All displays update automatically
- **User Input**: All user actions go through centralized handlers
- **State Synchronization**: UI always reflects current game state
- **Error Handling**: User actions are validated before execution

## Performance Considerations

### 1. Update Optimization
- **Delta Time**: All updates use delta time for consistent performance
- **Selective Updates**: Only update displays when necessary
- **Batch Operations**: Group similar operations together

### 2. Memory Management
- **Number Objects**: Efficient number handling
- **Object Reuse**: Reuse objects where possible
- **Cleanup**: Proper cleanup of timers and event listeners

### 3. UI Performance
- **DOM Updates**: Minimize DOM manipulation
- **Event Delegation**: Use event delegation for dynamic content
- **Lazy Loading**: Load content only when needed

## Extensibility Patterns

### 1. New Resource Types
- Add to `villageGame.resources` object
- Update resource generation logic
- Add UI elements for new resource

### 2. New Building Types
- Add to `villageGame.buildings` object
- Define cost, effect, and description
- Building system automatically handles new buildings

### 3. New Job Types
- Add to `villageGame.jobs` object
- Define cost, effect, and description
- Job system automatically handles new jobs

### 4. New Upgrade Types
- Add to `villageGame.upgrades` object
- Define cost, effect, and description
- Upgrade system automatically handles new upgrades

## Error Handling Patterns

### 1. Input Validation
- **Resource Checks**: Verify sufficient resources before purchases
- **Population Checks**: Verify available peasants before job assignment
- **State Validation**: Ensure game state remains consistent

### 2. Save/Load Error Handling
- **JSON Parsing**: Handle malformed save data gracefully
- **Version Compatibility**: Handle save file version differences
- **Data Recovery**: Attempt to recover from partial save data

### 3. UI Error Handling
- **Missing Elements**: Handle missing DOM elements gracefully
- **Invalid States**: Handle invalid game states in UI
- **User Feedback**: Provide clear error messages to users
