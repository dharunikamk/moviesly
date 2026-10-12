# MOVIESLY — Movie Discovery and Movie Night Planner

MOVIESLY is a web application designed to make movie discovery and movie-night planning more convenient. It brings together movie browsing, mood-based discovery, watchlist management, and personalised movie-night planning in a single interface.

The project focuses on creating a cohesive user experience that helps users discover what to watch and organise their viewing plans around their preferences.

## Features

- **Movie Discovery:** Browse and explore movie titles using data from The Movie Database (TMDB).
- **Category-Based Browsing:** Explore featured movies, short films, documentaries, animation and anime, and TV series and mini-series.
- **Search and Filtering:** Find titles using the available search, genre, and language filters.
- **Mood Matcher:** Discover movie suggestions based on your preferred mood.
- **Surprise:** Explore an unexpected movie when you are unsure what to watch.
- **Movie Night Planner:** Organise a movie night based on preferences, companions, viewing location, and timing.
- **Watchlist Management:** Save titles for future viewing.
- **Saved Plans:** Store and manage movie-night plans.
- **Theme Switching:** Choose between the Ivory & Peach and Midnight themes.
- **Responsive Design:** Browse the application across different screen sizes.

## Design Approach

MOVIESLY follows a European editorial-inspired visual direction, combining cinematic presentation, refined typography, and a restrained colour palette.

The application includes two themes:

- **Ivory & Peach:** A warm, light interface using ivory backgrounds with peach and muted rose accents.
- **Midnight:** A dark interface designed around deep backgrounds and contrasting accent colours.

The design aims to balance visual character with readability and ease of navigation.

## Technology Stack

- **React** — User interface development
- **JavaScript** — Application logic and interactivity
- **Vite** — Development environment and production build tooling
- **Tailwind CSS** — Utility-first styling, where configured in the project
- **TMDB API** — Movie data and discovery
- **localStorage** — Persistence of supported preferences, watchlist items, and saved plans
- **Lucide React** — Interface icons

## Getting Started

### Prerequisites

- Node.js
- npm
- A TMDB API key

### Installation

Clone the repository:

```bash
git clone https://github.com/dharunikamk/moviesly.git
```

Navigate to the project directory:

```bash
cd moviesly
```

Install the dependencies:

```bash
npm install
```

### Environment Configuration

Create a `.env.local` file in the project root and add your TMDB API key:

```env
VITE_TMDB_API_KEY=your_tmdb_api_key
```

Replace `your_tmdb_api_key` with your own API key.

Environment files containing credentials should not be committed to version control. Note that Vite exposes variables prefixed with `VITE_` to client-side code. A backend proxy is required if an API credential must remain private.

### Run the Application

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in the terminal.

### Production Build

Generate a production build:

```bash
npm run build
```

To preview the generated build locally:

```bash
npm run preview
```

## Project Structure

```text
moviesly/
├── public/
├── src/
│   ├── assets/
│   ├── lib/
│   │   └── tmdb.js
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
```

## Learning Objectives

MOVIESLY provides practical experience in:

- Building component-based interfaces with React
- Integrating a third-party REST API
- Managing application state and user interactions
- Persisting selected data using browser storage
- Designing responsive interfaces and reusable UI components
- Organising a frontend project for development and deployment

## Project Status

MOVIESLY is a personal portfolio project. Features and integrations are subject to testing and refinement as development progresses.

## Author

**Dharunika Muthukrishnan**

GitHub: [dharunikamk](https://github.com/dharunikamk)

Repository: [github.com/dharunikamk/moviesly](https://github.com/dharunikamk/moviesly)

## Acknowledgements

Movie data is provided by [The Movie Database (TMDB)](https://www.themoviedb.org/). MOVIESLY uses TMDB data but is not endorsed or certified by TMDB.