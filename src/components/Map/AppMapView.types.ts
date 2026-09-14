import { ViewStyle, StyleProp } from 'react-native';
import { GPSCoordinate } from '../../types/run';

export interface AppMapViewRef {
  animateCamera: (options: {
    center: { latitude: number; longitude: number };
    zoom?: number;
    pitch?: number;
    heading?: number;
    duration?: number;
  }) => void;
  fitToCoordinates: (
    coordinates: GPSCoordinate[],
    options?: {
      edgePadding?: { top: number; right: number; bottom: number; left: number };
      animated?: boolean;
    }
  ) => void;
}

export interface AppMapViewProps {
  currentCoord?: GPSCoordinate | null;
  routeCoordinates?: GPSCoordinate[];
  showStartMarker?: boolean;
  showFinishMarker?: boolean;
  showUserMarker?: boolean;
  onTouchStart?: () => void;
  style?: StyleProp<ViewStyle>;
  initialCenter?: { latitude: number; longitude: number };
  interactive?: boolean;
}
