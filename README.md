# TinyPromise

A habit-building mobile app focused on **3-day streaks**. Build habits through short, achievable commitments and decide after each streak whether to continue or move on.

## Concept

Instead of overwhelming users with indefinite goals, TinyPromise focuses on 3-day streaks. After completing a streak, the user decides: **"Quit or Keep Going?"** — making habit formation intentional and pressure-free.

## Features

- **3-Day Streaks** — Short, achievable habit commitments with progress indicators
- **Smart Reminders** — Customizable daily push notifications
- **Progress Dashboard** — Streak visualization with celebratory animations
- **Light Gamification** — Achievement badges for milestones
- **Guest Mode** — Start without an account; optional sync with authentication

## Tech Stack

- **Framework**: React Native with Expo (Expo Router for file-based navigation)
- **State**: React Context
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Notifications**: Expo Push Notifications
- **UI**: Custom components with Reanimated animations

## Setup

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go (iOS/Android) or run in a simulator.

## Project Structure

```
TinyPromise/
├── app/              # Expo Router pages (file-based routing)
├── components/       # Reusable UI components
├── contexts/         # React Context providers
├── hooks/            # Custom hooks
├── services/         # Firebase and API services
├── config/           # App configuration
├── constants/        # Static constants
├── types/            # TypeScript type definitions
├── assets/           # Images, fonts, animations
├── prd.md            # Product Requirements Document
├── planning.md       # Technical planning
└── implementations.md # Feature implementation log
```

## Docs

- [PRD](prd.md) — Product requirements and user stories
- [Planning](planning.md) — Technical architecture and data models
- [Implementation Log](implementations.md) — Feature tracker
