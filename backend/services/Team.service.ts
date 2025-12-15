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
      
      // Handle empty teams array
      if (!teams || teams.length === 0) {
        console.log('No teams found for user');
        return [];
      }
      
      // Sort by creation date (newest first)
      return teams.sort((a, b) => {
        const dateA = new Date(a.createdDateTime).getTime();
        const dateB = new Date(b.createdDateTime).getTime();
        return dateB - dateA;
      });
    } catch (error) {
      console.error('Failed to get teams - Full error details:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error instanceof Error ? error : new Error('Failed to fetch teams');
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

