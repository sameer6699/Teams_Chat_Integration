/**
 * Team Hook
 * React hook for team operations
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { teamApiService } from '../services/TeamApi.service';
import { ITeam } from '@/backend/models/Team.model';

export interface UseTeamReturn {
  teams: ITeam[];
  selectedTeam: ITeam | null;
  loading: boolean;
  error: string | null;
  loadTeams: () => Promise<void>;
  selectTeam: (teamId: string) => Promise<void>;
  refreshTeams: () => Promise<void>;
}

export function useTeam(): UseTeamReturn {
  const [teams, setTeams] = useState<ITeam[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<ITeam | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load all teams
   */
  const loadTeams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await teamApiService.getAllTeams();
      
      if (response.success && response.data) {
        setTeams(response.data);
      } else {
        setError(response.message || 'Failed to load teams');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Select a team
   */
  const selectTeam = useCallback(async (teamId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Find team in current list or load it
      let team = teams.find(t => t.id === teamId);
      if (!team) {
        const response = await teamApiService.getTeamById(teamId);
        if (response.success && response.data) {
          team = response.data;
        }
      }
      
      if (team) {
        setSelectedTeam(team);
      } else {
        setError('Team not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to select team');
    } finally {
      setLoading(false);
    }
  }, [teams]);

  /**
   * Refresh teams
   */
  const refreshTeams = useCallback(async () => {
    await loadTeams();
  }, [loadTeams]);

  // Load teams on mount
  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  return {
    teams,
    selectedTeam,
    loading,
    error,
    loadTeams,
    selectTeam,
    refreshTeams,
  };
}

