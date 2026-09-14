export interface GPSCoordinate {
  latitude: number;
  longitude: number;
  altitude?: number | null;
  accuracy?: number | null;
  speed?: number | null;
  timestamp: number;
}

export interface RunRecord {
  id: string;
  runNumber: number;
  date: string; // YYYY-MM-DD
  startTime: number;
  endTime: number;
  duration: number; // total active seconds
  distance: number; // in kilometers (e.g. 5.24)
  averageSpeed: number; // in km/h (e.g. 9.6)
  averagePace: string; // e.g. "6:15"
  coordinates: GPSCoordinate[];
  calories?: number;
}

export type GPSStatusType =
  | 'ready'
  | 'searching'
  | 'permission_denied'
  | 'disabled'
  | 'weak';

export interface ProfileStats {
  totalRuns: number;
  totalDistance: number; // km
  totalTime: number; // seconds
  averagePace: string; // MM:SS min/km
  longestDistance: number; // km
  bestPace: string; // MM:SS min/km
}

// Navigation Types
export type RootStackParamList = {
  MainTabs: undefined;
  Summary: { run: RunRecord };
  RunDetail: { run: RunRecord };
};

export type BottomTabParamList = {
  HomeTab: undefined;
  HistoryTab: undefined;
  ProfileTab: undefined;
};
