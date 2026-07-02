# CLAUDE.md — TinyPromise

Habit-building mobile app focused on 3-day streaks. React Native + Expo + Firebase.

## Key docs

- `prd.md` — Product requirements and user stories
- `planning.md` — Technical architecture, data models, UI flow
- `implementations.md` — Feature implementation tracker
- `priority.md` — Feature priority list
- `screens.md` — Screen designs

## Stack

- React Native with Expo (Expo Router)
- Firebase (Auth, Firestore)
- Expo Push Notifications
- React Context for state

## Running

```bash
npm install
npx expo start
```

## Architecture

File-based routing under `app/`. Auth context wraps the app. Firebase services in `services/`.
