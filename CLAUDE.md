# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Space Invaders web game implemented in vanilla JavaScript using HTML5 Canvas, containerized with Docker and nginx. The project is entirely self-contained with no build dependencies or package management.

## Development Commands

### Running the Application
```bash
# Start the game (recommended)
docker-compose up -d

# Access at http://localhost:8080
```

### Testing
```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Alternative Docker Commands
```bash
# Build and run manually
docker build -t space-invaders .
docker run -d -p 8080:80 --name space-invaders-game space-invaders
```

### Stopping the Application
```bash
# Docker Compose
docker-compose down

# Manual Docker
docker stop space-invaders-game && docker rm space-invaders-game
```

## Architecture

### File Structure
- `index.html` - Main game page with embedded CSS styling
- `game.js` - Complete game engine using ES6 classes
- `Dockerfile` - nginx Alpine container configuration
- `docker-compose.yml` - Service orchestration
- `nginx.conf` - Web server configuration with proper MIME types

### Game Engine Architecture
- **Game Class**: Main game controller with game loop using `requestAnimationFrame`
- **Canvas Rendering**: 2D graphics at 800x600 resolution
- **Object System**: Player, invaders (5x10 grid), bullets, and collision detection
- **Input System**: Keyboard event handlers for movement and shooting
- **State Management**: Score tracking, game over conditions, restart functionality

### Deployment Architecture
- Static files served by nginx
- Container exposes port 80, mapped to host port 8080
- No server-side processing required
- Development-friendly cache headers for HTML files

## Game Mechanics

### Controls
- Arrow keys: Player movement
- Space: Shoot bullets
- R key: Restart when game over

### Gameplay Elements
- Player vs 50 invaders (5 rows × 10 columns)
- Bidirectional shooting (player and invaders)
- Formation movement with direction changes at screen edges
- Score system: 10 points per invader
- Progressive difficulty: New wave spawns when all invaders destroyed

## Development Notes

- No build process or dependencies required
- Pure vanilla JavaScript with ES6 class syntax
- CSS embedded in HTML for simplicity
- Japanese language UI elements
- Rectangle-based collision detection system
- Responsive canvas rendering with fixed aspect ratio