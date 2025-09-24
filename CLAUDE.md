# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm start` or `expo start`
- **Run on Android**: `npm run android` or `expo run:android`
- **Run on iOS**: `npm run ios` or `expo run:ios`
- **Run on Web**: `npm run web` or `expo start --web`

## Project Architecture

This is a React Native mobile application built with Expo and TypeScript. The app follows a feature-based folder structure with clear separation of concerns.

### Core Technologies
- **Expo SDK 52** with new architecture enabled
- **React Navigation** for navigation (stack and tab navigation)
- **Zustand** for state management
- **TanStack Query (React Query)** for data fetching and caching
- **Axios** for HTTP requests
- **React Native Toast Message** for notifications

### Architecture Overview

**Navigation Flow**: The app uses a conditional navigation structure based on authentication state:
- Unauthenticated users see `AuthStack`
- Authenticated users see `MainTabs` (bottom tab navigation)
- Navigation configuration is centralized in `src/navigation/index.tsx`

**State Management**: 
- Authentication state managed by `useAuthStore` (Zustand)
- Theme state managed by `useThemeStore` (Zustand)
- Server state managed by TanStack Query

**Folder Structure**:
- `src/components/` - Reusable UI components organized by type (buttons, inputs, lists, overlays)
- `src/screens/` - Screen components organized by feature
- `src/navigation/` - Navigation configuration (stacks and tabs)
- `src/services/` - API calls, mutations, queries, and external services
- `src/store/` - Zustand stores for client state
- `src/constants/` - Theme, typography, and other constants
- `src/utils/` - Utility functions and helpers

### Key Files
- `App.tsx` - Root component with QueryClient provider and Toast configuration
- `src/navigation/index.tsx` - Main navigation controller with auth flow logic
- `src/types.ts` - TypeScript type definitions
- `src/constants/Theme.ts` - Theme configuration for light/dark modes

### Development Notes
- The project uses strict TypeScript configuration
- Authentication is currently mocked with a 3-second timeout (see `src/navigation/index.tsx:41-47`)
- API endpoints are prepared but commented out in service files
- The app uses Expo's new architecture and includes Android-specific configuration