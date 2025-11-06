/**
 * Team Controller
 * Handles team-related HTTP requests
 */

import { NextRequest, NextResponse } from 'next/server';
import { TeamService } from '../services/Team.service';
import { AuthService } from '../services/Auth.service';

export class TeamController {
  private teamService: TeamService;
  private authService: AuthService;

  constructor() {
    this.teamService = new TeamService();
    this.authService = new AuthService();
  }

  /**
   * Get all teams for current user
   * GET /api/teams
   */
  async getTeams(request: NextRequest): Promise<NextResponse> {
    try {
      // Get access token
      const accessToken = await this.authService.getAccessToken();
      if (!accessToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Get teams
      const teams = await this.teamService.getAllTeams(accessToken);

      return NextResponse.json({
        success: true,
        data: teams.map(team => team.toJSON()),
      });
    } catch (error) {
      console.error('Get teams error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch teams',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  }

  /**
   * Get team by ID
   * GET /api/teams/[id]
   */
  async getTeamById(request: NextRequest, teamId: string): Promise<NextResponse> {
    try {
      // Get access token
      const accessToken = await this.authService.getAccessToken();
      if (!accessToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Get team
      const team = await this.teamService.getTeamById(accessToken, teamId);

      return NextResponse.json({
        success: true,
        data: team.toJSON(),
      });
    } catch (error) {
      console.error('Get team error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch team',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  }
}

