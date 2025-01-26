# TinyPromise - Product Requirements Document (PRD)

## 1. Project Overview
TinyPromise is a habit-building app focused on creating **3-day streaks** to help users form new habits and make better decisions on whether to continue or quit after each streak. The goal is to keep the app simple, engaging, and intuitive, offering light gamification, reminders, and basic analytics to help users stay consistent.

---

## 2. MVP Features

### 1. Habit Tracking with 3-Day Streaks
- **Feature Description**: 
  - Users can create and track habits with a focus on completing 3-day streaks.
  - A simple progress indicator (day 1 of 3, day 2 of 3) is shown for each habit.
  - After 3 days, the user is prompted to decide: **"Quit or Keep Going?"**
- **User Stories**:
  - As a user, I want to create habits easily and see my progress toward completing a 3-day streak.
  - As a user, I want a simple option to either extend my streak or complete my habit.

---

### 2. Habit Reminders
- **Feature Description**: 
  - Set daily reminders for each habit.
  - Reminders are customizable for time and frequency.
  - Push notifications remind users of their habit progress and to complete their task.
- **User Stories**:
  - As a user, I want to be reminded daily to complete my habit.
  - As a user, I want the reminder to be motivational and timely.

---

### 3. Progress Visualization
- **Feature Description**: 
  - Display a dashboard with a list of all active habits and their current streak progress.
  - Completed habits have a visual badge or reward system.
  - Confetti animation or simple celebratory effects will appear when a streak is completed.
- **User Stories**:
  - As a user, I want to see my progress clearly for each habit.
  - As a user, I want to feel motivated by seeing rewards for completing streaks.

---

### 4. Simple Onboarding
- **Feature Description**:
  - 2–3 introductory screens explaining the app’s concept.
  - Offer a set of predefined habit suggestions (e.g., "Drink Water," "Stretch").
- **User Stories**:
  - As a user, I want a simple and clear onboarding flow that explains how the app works.
  - As a user, I want suggested habits to get started with quickly.

---

### 5. Core Gamification
- **Feature Description**:
  - Provide badges for completing milestones like "First Streak Completed" and "Completed 3 Streaks."
  - Display a list of achievements that users can earn.
  - Motivational messages after completing a streak.
- **User Stories**:
  - As a user, I want to be rewarded for completing milestones to keep me motivated.
  - As a user, I want positive feedback after completing a streak.

---

### 6. Light Authentication
- **Feature Description**: 
  - Allow users to use the app without an account (Guest Mode).
  - For logged-in users, sync their data to save progress across devices using Firebase or similar service.
- **User Stories**:
  - As a user, I want to quickly start using the app without signing up.
  - As a user, I want my progress saved across devices when logged in.

---

### 7. Minimal Settings
- **Feature Description**:
  - Allow users to edit habit names, set reminder times, and delete habits.
  - Simple toggle for enabling/disabling notifications globally or for individual habits.
- **User Stories**:
  - As a user, I want to edit my habits and customize my notifications.
  - As a user, I want to delete habits I no longer wish to track.
