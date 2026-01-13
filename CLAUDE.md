# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**JW Discord Frontend** - A Vue.js 2 web dashboard for managing the JW Discord Bot. Built on the Metronic Vue template with Vuetify and Bootstrap-Vue.

### JW Discord Ecosystem

This frontend is part of a 3-project ecosystem:

| Project | Description | Stack |
|---------|-------------|-------|
| `jw-discord-bot` | Discord bot that users interact with | Node.js, Discord.js v12, MongoDB |
| `jw-discord-api` | REST API backend for this dashboard | Express, Awilix DI, JWT auth |
| `jw-discord-frontend` | **This project** - Web dashboard for bot management | Vue.js 2, Vuetify, Metronic |

**How it connects:**
- Authenticates users via Discord OAuth2 through `jw-discord-api`
- Displays guilds where the user has admin permissions
- Shares the same MongoDB database (via API)

---

## Commands

```bash
# Install dependencies
yarn install

# Development server (hot reload)
yarn serve

# Production build
yarn build

# Lint and fix files
yarn lint
```

**Environment:** Requires `VUE_APP_JW_DISCORD_API` environment variable pointing to the API URL.

---

## Architecture

### Tech Stack

- **Vue.js 2.6** with Vue Router and Vuex
- **Vuetify 2.4** - Material Design component framework
- **Bootstrap-Vue** - Bootstrap 4 components
- **Metronic 7.2** - Admin template (Demo 4)
- **Axios** - HTTP client (via `vue-axios`)

### Directory Structure

```
src/
├── App.vue                    # Root component, global styles
├── main.js                    # Vue initialization, plugin setup
├── router.js                  # Route definitions
├── core/
│   ├── config/
│   │   ├── i18n/              # Translation files (en, es, fr, de, ch, jp)
│   │   └── layout.config.json # Metronic layout configuration
│   ├── plugins/               # Vue plugin configurations
│   │   ├── vuetify.js         # Vuetify setup
│   │   ├── vue-i18n.js        # i18n setup
│   │   └── metronic.js        # Metronic utilities
│   ├── services/
│   │   ├── api.service.js     # Axios wrapper with JWT
│   │   ├── jwt.service.js     # Token storage (localStorage)
│   │   ├── i18n.service.js    # Language management
│   │   └── htmlclass.service.js
│   └── services/store/        # Vuex modules
│       ├── index.js           # Store configuration
│       ├── auth.module.js     # Authentication state
│       ├── guild.module.js    # Guild management
│       ├── profile.module.js  # User profile
│       ├── config.module.js   # Layout configuration
│       ├── breadcrumbs.module.js
│       └── htmlclass.module.js
└── view/
    ├── layout/                # Main layout components
    │   ├── Layout.vue         # Authenticated layout wrapper
    │   ├── aside/             # Sidebar navigation
    │   ├── header/            # Top navigation
    │   └── footer/
    ├── pages/
    │   ├── Dashboard.vue      # Main dashboard (guild list)
    │   ├── auth/              # Login/Register pages
    │   └── error/             # Error pages
    └── content/               # Reusable content components
        ├── widgets/           # Dashboard widgets
        └── dropdown/          # Dropdown menus
```

---

## Key Patterns

### API Service (`src/core/services/api.service.js`)

Centralized HTTP client with JWT header injection:

```javascript
import ApiService from "@/core/services/api.service";

// Initialize once (done in main.js)
ApiService.init();

// Set auth header after login
ApiService.setHeader();

// Use methods
ApiService.get('resource', 'slug');
ApiService.post('resource', data);
ApiService.put('resource', data);
ApiService.update('resource', 'slug', data);
ApiService.delete('resource');
```

**Base URL:** Set via `VUE_APP_JW_DISCORD_API` environment variable.

### JWT Service (`src/core/services/jwt.service.js`)

Token management in localStorage:

```javascript
import JwtService from "@/core/services/jwt.service";

JwtService.getToken();
JwtService.saveToken(token);
JwtService.destroyToken();
```

### Vuex Store Modules

**Authentication (`auth.module.js`):**
- `LOGIN`, `LOGOUT`, `REGISTER` - Auth actions
- `EXCHANGE_CODE` - Discord OAuth2 code exchange
- `VERIFY_AUTH` - Token validation
- `isAuthenticated`, `currentUser` - Getters

**Guild (`guild.module.js`):**
- `GET_GUILDS_ACTION` - Fetch user's administrable guilds
- Filters to guilds where user is owner or has MANAGE_GUILD permission

### Layout System

The app uses Metronic's layout configuration system:
- Config stored in `src/core/config/layout.config.json`
- Overrides stored in localStorage
- `OVERRIDE_LAYOUT_CONFIG` action loads saved preferences

### Authentication Flow

1. User clicks login, redirected to Discord OAuth2
2. Discord redirects back with authorization code to `/auth`
3. `Code.vue` extracts code and calls `EXCHANGE_CODE` action
4. API exchanges code for tokens, returns JWT
5. JWT stored via `JwtService`, user redirected to dashboard
6. `Layout.vue` checks `isAuthenticated` on mount, redirects to login if false

### Guild Display

`Dashboard.vue` displays guilds where user can manage the bot:
```javascript
// Filter logic in guild.module.js
guilds.filter(guild =>
  guild.owner === true ||
  (guild.permissions & 0x0000000020) != 0  // MANAGE_GUILD permission
);
```

---

## Deployment

Configured for Netlify deployment:
- `netlify.toml` handles SPA routing (all routes to `/index.html`)
- Uses Vue Router history mode

---

## Related Projects

- **jw-discord-bot** (`../jw-discord-bot/`)
  - Discord bot with daily texts, news, topics
  - Message-based commands (prefix: `jw!`)

- **jw-discord-api** (`../jw-discord-api/`)
  - REST API this frontend consumes
  - `/api/v1/auth/login` - Discord OAuth2 exchange
  - `/api/v1/guilds` - Guild management
