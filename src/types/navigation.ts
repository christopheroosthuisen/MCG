/**
 * MCG Golf App - Navigation Types
 * Type-safe navigation throughout the app
 */

// Main tab routes
export type TabRoutes = {
  index: undefined;           // Home/Dashboard
  practice: undefined;        // Practice hub
  analyze: undefined;         // Video analysis
  learn: undefined;           // Lessons & drills
  profile: undefined;         // User profile
};

// Stack routes for each tab
export type HomeStackRoutes = {
  home: undefined;
  'quick-session': { type?: string };
  notifications: undefined;
};

export type PracticeStackRoutes = {
  'practice-hub': undefined;
  'session-setup': { type: string };
  'active-session': { sessionId: string };
  'session-summary': { sessionId: string };
};

export type AnalyzeStackRoutes = {
  'analyze-hub': undefined;
  'record-swing': { club?: string };
  'analysis-detail': { analysisId: string };
  'compare-swings': { analysisIds: string[] };
  'swing-library': undefined;
};

export type LearnStackRoutes = {
  'learn-hub': undefined;
  'lesson-detail': { lessonId: string };
  'drill-detail': { drillId: string };
  'drill-session': { drillId: string };
  'coach-chat': undefined;
  'skill-path': { pathId: string };
};

export type ProfileStackRoutes = {
  'profile-main': undefined;
  'edit-profile': undefined;
  'my-stats': undefined;
  'my-clubs': undefined;
  'settings': undefined;
  'subscription': undefined;
};

// Modal routes (presented over any screen)
export type ModalRoutes = {
  'video-player': { videoUrl: string; title?: string };
  'metric-detail': { metric: string; value: number; history?: any[] };
  'club-selector': { onSelect: (club: string) => void };
  'shot-result': { shotId: string };
  'achievement': { achievementId: string };
};

// All routes combined
export type AllRoutes =
  & TabRoutes
  & HomeStackRoutes
  & PracticeStackRoutes
  & AnalyzeStackRoutes
  & LearnStackRoutes
  & ProfileStackRoutes
  & ModalRoutes;

export type RouteName = keyof AllRoutes;
