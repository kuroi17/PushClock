# CampusTrackr Project Context

## Project Overview

CampusTrackr is a modern web application for campus tracking and management built with:

- **Frontend**: React 19 with Vite
- **Styling**: Tailwind CSS 4
- **Backend**: Supabase (authentication, database)
- **Email**: EmailJS integration
- **Routing**: React Router v7
- **UI Components**: Headless UI, Lucide React icons
- **Testing**: Playwright

## Tech Stack Details

- **Language**: JavaScript (ES Modules)
- **Build Tool**: Vite 7
- **Deployment**: Vercel
- **State Management**: React hooks
- **Notifications**: React Hot Toast

## Project Structure

```
CampusTrackr/
├── src/
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # Entry point
│   ├── index.css            # Global styles
│   ├── components/          # Reusable UI components
│   └── pages/              # Page components (routing)
├── utils/
│   ├── supabase.js         # Supabase client
│   ├── emailService.js     # EmailJS integration
│   ├── notification.js     # Toast notifications
│   ├── LocalStorage.jsx    # Local storage utilities
│   └── storage.js          # Storage helpers
├── public/images/          # Static images
└── tests/                  # Playwright tests
```

## Development Guidelines

- Follow React best practices and hooks patterns
- Use Tailwind CSS for all styling
- Ensure mobile-first responsive design
- Maintain accessibility standards (WCAG 2.1 AA)
- Test with Playwright for E2E scenarios
- Keep components modular and reusable

## Key Features

- Campus tracking functionality
- Email notifications via EmailJS
- User authentication via Supabase
- Real-time data updates
- Responsive mobile interface

## Agent Usage

When working on this project:

1. Frontend development → Use `@frontend-developer` agent
2. UI/UX design → Use `@ui-designer` or `@ux-architect` agents
3. Backend/API → Use `@backend-architect` agent
4. Feature planning → Use `@sprint-prioritizer` agent

## Commands

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
