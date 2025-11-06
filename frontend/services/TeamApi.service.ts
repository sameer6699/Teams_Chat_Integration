/**
 * Team API Service
 * Handles team-related API calls
 */

import { apiClient, ApiResponse } from './ApiClient.service';
import { ITeam } from '@/backend/models/Team.model';

export class TeamApiService {
  /**
   * Get all teams
   */
  async getAllTeams(): Promise<ApiResponse<ITeam[]>> {
    return await apiClient.get<ITeam[]>('/teams');
  }

  /**
   * Get team by ID
   */
  async getTeamById(teamId: string): Promise<ApiResponse<ITeam>> {
    return await apiClient.get<ITeam>(`/teams/${teamId}`);
  }
}

// Export singleton instance
export const teamApiService = new TeamApiService();

