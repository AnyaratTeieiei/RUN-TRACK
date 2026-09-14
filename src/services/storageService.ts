import AsyncStorage from '@react-native-async-storage/async-storage';
import { RunRecord, ProfileStats } from '../types/run';
import { calculatePace } from '../utils/paceCalculator';

const STORAGE_KEY = '@run_track_history_v1';

export const storageService = {
  /**
   * Retrieves all saved run records from AsyncStorage, sorted newest first.
   */
  async getAllRuns(): Promise<RunRecord[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      const runs: RunRecord[] = JSON.parse(data);
      return runs.sort((a, b) => b.startTime - a.startTime);
    } catch (error) {
      console.error('Error fetching runs from storage:', error);
      return [];
    }
  },

  /**
   * Saves a newly completed run.
   */
  async saveRun(
    runData: Omit<RunRecord, 'id' | 'runNumber'>
  ): Promise<RunRecord> {
    try {
      const existingRuns = await this.getAllRuns();
      const nextRunNumber = existingRuns.length + 1;
      const newId = `run_${Date.now()}`;

      const newRecord: RunRecord = {
        ...runData,
        id: newId,
        runNumber: nextRunNumber,
      };

      const updatedRuns = [newRecord, ...existingRuns];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRuns));
      return newRecord;
    } catch (error) {
      console.error('Error saving run to storage:', error);
      throw error;
    }
  },

  /**
   * Retrieves a specific run by ID.
   */
  async getRunById(id: string): Promise<RunRecord | null> {
    try {
      const runs = await this.getAllRuns();
      return runs.find((r) => r.id === id) || null;
    } catch (error) {
      console.error(`Error finding run ${id}:`, error);
      return null;
    }
  },

  /**
   * Deletes a run by ID.
   */
  async deleteRun(id: string): Promise<boolean> {
    try {
      const runs = await this.getAllRuns();
      const filtered = runs.filter((r) => r.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error(`Error deleting run ${id}:`, error);
      return false;
    }
  },

  /**
   * Clears all run history (useful for reset/debugging).
   */
  async clearAllRuns(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing runs:', error);
    }
  },

  /**
   * Calculates athlete profile lifetime statistics from saved runs.
   */
  async getProfileStats(): Promise<ProfileStats> {
    const runs = await this.getAllRuns();

    if (runs.length === 0) {
      return {
        totalRuns: 0,
        totalDistance: 0,
        totalTime: 0,
        averagePace: '--:--',
        longestDistance: 0,
        bestPace: '--:--',
      };
    }

    let totalDistance = 0;
    let totalTime = 0;
    let longestDistance = 0;
    let bestPaceSeconds = Infinity;

    for (const run of runs) {
      totalDistance += run.distance;
      totalTime += run.duration;
      if (run.distance > longestDistance) {
        longestDistance = run.distance;
      }

      if (run.distance >= 0.5 && run.duration > 0) {
        const paceSec = run.duration / run.distance;
        if (paceSec < bestPaceSeconds) {
          bestPaceSeconds = paceSec;
        }
      }
    }

    const avgPace = calculatePace(totalDistance, totalTime);
    let bestPaceStr = '--:--';
    if (bestPaceSeconds !== Infinity) {
      const mins = Math.floor(bestPaceSeconds / 60);
      const secs = Math.floor(bestPaceSeconds % 60);
      bestPaceStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    return {
      totalRuns: runs.length,
      totalDistance: Math.round(totalDistance * 100) / 100,
      totalTime,
      averagePace: avgPace,
      longestDistance: Math.round(longestDistance * 100) / 100,
      bestPace: bestPaceStr,
    };
  },
};
