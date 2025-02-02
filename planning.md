# TinyPromise – Product & Technical Planning

## 1. Product Overview and Target Audience
TinyPromise is a habit-building app centered on 3-day streaks. It targets individuals seeking quick, achievable habit formation with minimal setup and lightweight progress tracking. The audience includes students, professionals, and anyone wanting a simple, motivating approach to habit creation.

## 2. Core Features and User Stories
- **Habit Tracking (3-Day Streaks)**: Create and track habits, toggle “Quit or Keep Going?” after each streak.
- **Reminders**: Push notifications for daily tasks.
- **Progress Visualization**: Dashboard with streak indicators and celebratory animations.
- **Simple Onboarding**: Quick explanation of app concept and suggested habits.
- **Core Gamification**: Achievement badges for completed milestones.
- **Light Authentication**: Guest mode or user accounts with sync via a backend service.
- **Minimal Settings**: Editing habits, toggling reminders, and removing unneeded habits.

## 3. Technical Architecture (React Native + Expo)
- **Frontend**: React Native with Expo for cross-platform UI, using Hooks and Redux or Context for state.
- **Notifications**: Expo’s push notification API to schedule daily reminders.
- **Backend**: Firebase (or similar) for user authentication, data sync, and cloud storage.
- **Data Layer**: Realtime database or Firestore for habit and streak data, with offline caching.

## 4. UI/UX Design Guidelines and Navigation Flow
- **Navigation**: Stack-based flow (Onboarding → Dashboard → Habit Detail → Settings).
- **Design**: Simple, colorful streak progress bars; celebratory animations. Clear calls to action for habit setup.
- **Accessibility**: Large tap targets, minimal text input for quick setup, color contrast for readability.

## 5. API Specifications and Data Models
- **User**: { userId, email, habits[] }.
- **Habit**: { habitId, title, reminders[], currentStreak, lastUpdated }.
- **Endpoints** (Firebase):
  - GET/POST/PUT for habit documents.
  - Sync user data across devices upon login.

## 6. Development Milestones and Timeline
1. **Week 1**: Project setup, architecture definitions, onboarding flow.
2. **Week 2**: Habit creation, 3-day streak logic, push notifications.
3. **Week 3**: Dashboard, gamification badges, user auth integration.
4. **Week 4**: QA testing, final polish, deployment preparations.

## 7. Testing Strategy and Quality Requirements
- **Unit Tests**: Cover streak logic, notifications, UI components.
- **Integration Tests**: Validate data sync with Firebase, push notifications.
- **User Acceptance**: Limited beta to gather feedback on usability.

## 8. Deployment and Release Plan
- **App Stores**: Publish iOS and Android binaries via Expo. 
- **Staged Rollouts**: Incremental release to gather feedback and fix any issues before full launch.
- **Versioning**: Semantic versioning for major, minor, patch updates.

## 9. Performance Metrics and Success Criteria
- **User Engagement**: Daily active users, streak completions. 
- **Notification Interactions**: CTR on reminders.
- **Retention**: User frequency over 1-week and 1-month periods.

## 10. Security Considerations and Compliance Needs
- **Data Protection**: Secure user data handling with Firebase Security Rules.
- **Compliance**: Ensure GDPR considerations for user data where applicable.
- **Authentication**: Minimal friction while safeguarding personal info.

## Potential Technical Challenges
- **Offline Functionality**: Ensuring habit data remains accurate if no network.
- **Push Notifications**: Handling complexities on different platforms.
- **Scalability**: Efficiently managing data for increased users.

## Third-Party Dependencies
- **Firebase/Firestore**: Authentication, data sync.
- **Expo**: Notifications, build pipeline.
- **React Navigation**: App flow.

## Required Development Resources
- React Native expertise, Firebase setup, QA testing devices.

## Gamification and Statistics

### Gamification

*   **Badges:**
    *   **First Streak Completed:** Awarded when a user completes their first 3-day streak for any habit.
    *   **Triple Threat:** Awarded when a user completes 3 streaks (can be for different habits).
    *   **Consistency Champion (levels 1-3):** Awarded for completing 5, 10, and 20 streaks respectively.
    *   **Habit Hacker:** Awarded for creating 5 habits.
    *   **Resilient Streak:** Awarded for resuming a paused habit and completing a streak.
*   **Achievements/Rewards Screen:**
    *   Display earned badges with clear descriptions of how they were obtained.
    *   Show locked badges with hints on how to unlock them (e.g., "Complete 10 streaks to unlock").
    *   Consider adding a progress bar towards unlocking the next badge.
*   **Motivational Messages:**
    *   Display a congratulatory message when a user completes a streak (e.g., "You're on fire! Streak completed!").
    *   Provide encouraging messages when a user resumes a paused habit (e.g., "Welcome back! Let's get this streak going again.").

### Statistics

*   **Habit Statistics:**
    *   **Current Streak:** Display the current streak length for each habit.
    *   **Longest Streak:** Show the longest streak ever achieved for each habit.
    *   **Completion Rate:** Calculate and display the percentage of successful streaks for each habit (e.g., "Completed 7 out of 10 streaks").
    *   **Total Streaks Completed:** Show the total number of 3-day streaks completed for each habit.
*   **Overall Statistics:**
    *   **Total Streaks Completed (All Habits):** Display the total number of 3-day streaks completed across all habits.
    *   **Average Streak Length:** Calculate and display the average streak length across all habits.
    *   **Most Successful Habit:** Highlight the habit with the highest completion rate or longest streak.
*   **Visualizations:**
    *   **Streak Calendar:** Use a calendar view to show daily progress for each habit, highlighting completed streaks.
    *   **Progress Charts:** Use bar charts or line graphs to visualize streak completion rates, longest streaks, or other relevant metrics over time.
    *   **Overall Progress:** Display a summary of the user's overall progress, such as the total number of streaks completed or the percentage of habits with active streaks.