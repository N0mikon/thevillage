# Technical Context: The Village

## Technologies Used

### Core Technologies
- **HTML5**: Semantic markup for game structure with embedded CSS and JavaScript
- **CSS3**: Styling with modern features (Grid, Flexbox, transitions, serif fonts)
- **Vanilla JavaScript**: No frameworks, pure ES6+ JavaScript with native number handling
- **Local Storage**: Browser-based data persistence

### External Dependencies
- **None**: All functionality implemented with vanilla web technologies
- **Local Storage API**: Browser-based data persistence

### Development Tools
- **Git**: Version control
- **Web Browser**: Primary development and testing environment
- **Text Editor**: Any modern text editor with syntax highlighting

## Development Setup

### File Structure
```
thevillage/
├── index.html          # Main game page (HTML, CSS, and embedded JS)
├── village.js          # Core game logic and state management
├── memory-bank/        # Project documentation
│   ├── projectbrief.md
│   ├── productContext.md
│   ├── systemPatterns.md
│   ├── techContext.md
│   ├── activeContext.md
│   └── progress.md
└── README.md           # Project overview
```

### Browser Compatibility
- **Modern Browsers**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **Mobile Browsers**: iOS Safari 12+, Chrome Mobile 60+
- **Features Used**: ES6 modules, Local Storage, CSS Grid, CSS Flexbox

## Technical Constraints

### Performance Constraints
- **Update Frequency**: 100ms game tick interval
- **Memory Usage**: Efficient object management for long play sessions
- **DOM Updates**: Minimized for smooth performance
- **Save Size**: Local storage has ~5-10MB limit

### Browser Limitations
- **Local Storage**: 5-10MB storage limit per domain
- **JavaScript Execution**: Single-threaded, must avoid blocking
- **Memory Management**: Garbage collection can cause pauses
- **Cross-Origin**: No external API calls without CORS

### Platform Constraints
- **Desktop**: Primary target platform
- **Mobile**: Responsive design for mobile browsers
- **Offline**: Must work without internet connection
- **Cross-Platform**: Must work on Windows, Mac, Linux

## Architecture Decisions

### 1. No Framework Choice
**Decision**: Use vanilla JavaScript instead of frameworks like React, Vue, or Angular

**Rationale**:
- **Simplicity**: Easier to understand and modify
- **Performance**: No framework overhead
- **Learning**: Better for understanding core concepts
- **Size**: Smaller bundle size
- **Compatibility**: Works in any modern browser

### 2. Native JavaScript Numbers
**Decision**: Use native JavaScript number handling instead of Decimal.js

**Rationale**:
- **Simplicity**: No external dependencies
- **Performance**: Native number operations are faster
- **Compatibility**: Works seamlessly with JSON serialization
- **Sufficient**: JavaScript numbers handle the game's number ranges adequately

### 3. Local Storage for Persistence
**Decision**: Use browser's Local Storage API for save data

**Rationale**:
- **Simplicity**: No server required
- **Privacy**: Data stays on user's device
- **Reliability**: Built into all modern browsers
- **Performance**: Fast read/write operations

### 4. CSS Grid for Layout
**Decision**: Use CSS Grid for village exploration grid

**Rationale**:
- **Flexibility**: Easy to create responsive grids
- **Performance**: Hardware-accelerated
- **Maintainability**: Clean, declarative layout code
- **Browser Support**: Excellent modern browser support

## Development Workflow

### 1. Local Development
```bash
# Clone repository
git clone [repository-url]
cd thevillage

# Open in browser
open index.html
# or
python -m http.server 8000  # Python 3
# or
npx serve .                # Node.js
```

### 2. Testing Strategy
- **Manual Testing**: Play through game scenarios
- **Browser Testing**: Test in multiple browsers
- **Mobile Testing**: Test responsive design
- **Save/Load Testing**: Verify data persistence
- **Performance Testing**: Monitor memory usage and frame rate

### 3. Deployment
- **Static Hosting**: Can be deployed to any static hosting service
- **CDN**: Optional CDN for faster loading
- **HTTPS**: Required for some browser features
- **Compression**: Gzip compression for smaller file sizes

## Security Considerations

### 1. Client-Side Security
- **Input Validation**: All user input is validated
- **XSS Prevention**: No dynamic HTML injection
- **Data Sanitization**: Save data is validated on load
- **Local Storage**: Data is stored locally, not transmitted

### 2. Data Integrity
- **Save Validation**: Save files are validated before loading
- **Error Recovery**: Graceful handling of corrupted saves
- **Version Compatibility**: Handle save file version differences
- **Backup**: Users can export saves for backup

## Performance Optimization

### 1. JavaScript Optimization
- **Event Delegation**: Use event delegation for dynamic content
- **Debouncing**: Debounce frequent events like mouse moves
- **Object Pooling**: Reuse objects where possible
- **Lazy Loading**: Load content only when needed

### 2. CSS Optimization
- **Efficient Selectors**: Use efficient CSS selectors
- **Hardware Acceleration**: Use transform and opacity for animations
- **Minification**: Minify CSS for production
- **Critical CSS**: Inline critical CSS for faster rendering

### 3. DOM Optimization
- **Minimal DOM Manipulation**: Batch DOM updates
- **Document Fragments**: Use document fragments for multiple inserts
- **Event Listeners**: Remove event listeners when no longer needed
- **Memory Leaks**: Avoid memory leaks from closures

## Future Technical Considerations

### 1. Scalability
- **Modular Architecture**: Easy to add new features
- **Plugin System**: Potential for mod support
- **API Integration**: Could add cloud save functionality
- **Multiplayer**: Could add real-time multiplayer features

### 2. Performance Improvements
- **Web Workers**: Offload heavy calculations
- **Service Workers**: Add offline functionality
- **IndexedDB**: Larger storage capacity
- **WebAssembly**: Performance-critical calculations

### 3. Platform Expansion
- **Mobile Apps**: React Native or Flutter versions
- **Desktop Apps**: Electron wrapper
- **Steam**: Desktop distribution
- **Console**: Potential console ports
