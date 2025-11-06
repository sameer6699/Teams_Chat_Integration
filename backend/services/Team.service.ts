/**
 * Team Service
 * Business logic for Microsoft Teams operations
 */

import { TeamModel, ITeam } from '../models/Team.model';
import { GraphApiService } from './GraphApi.service';

export interface ITeamService {
  getAllTeams(accessToken: string): Promise<TeamModel[]>;
  getTeamById(accessToken: string, teamId: string): Promise<TeamModel>;
}

export class TeamService implements ITeamService {
  private graphApiService: GraphApiService;

  constructor() {
    this.graphApiService = new GraphApiService();
  }

  /**
   * Get all teams for current user
   */
  async getAllTeams(accessToken: string): Promise<TeamModel[]> {
    try {
      const teams = await this.graphApiService.getTeams(accessToken);
      
      // Sort by creation date (newest first)
      return teams.sort((a, b) => {
        return new Date(b.createdDateTime).getTime() - new Date(a.createdDateTime).getTime();
      });
    } catch (error) {
      console.error('Failed to get teams:', error);
      throw new Error('Failed to fetch teams');
    }
  }

  /**
   * Get team by ID
   */
  async getTeamById(accessToken: string, teamId: string): Promise<TeamModel> {
    try {
      const teams = await this.getAllTeams(accessToken);
      const team = teams.find((t) => t.id === teamId);
      
      if (!team) {
        throw new Error('Team not found');
      }

      return team;
    } catch (error) {
      console.error('Failed to get team:', error);
      throw new Error('Failed to fetch team');
    }
  }
}

