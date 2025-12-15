/**
 * Team Controller
 * Handles team-related HTTP requests
 */

import { NextRequest, NextResponse } from 'next/server';
import { TeamService } from '../services/Team.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class TeamController {
  private teamService: TeamService;

  constructor() {
    this.teamService = new TeamService();
  }

  /**
   * Get all teams for current user
   * GET /api/teams
   */
  async getTeams(request: AuthenticatedRequest): Promise<NextResponse> {
    try {
      // Get access token from authenticated request (set by middleware)
      const accessToken = request.accessToken;
      if (!accessToken) {
        return NextResponse.json({ error: 'Unauthorized', message: 'No access token provided' }, { status: 401 });
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
  async getTeamById(request: AuthenticatedRequest, teamId: string): Promise<NextResponse> {
    try {
      // Get access token from authenticated request (set by middleware)
      const accessToken = request.accessToken;
      if (!accessToken) {
        return NextResponse.json({ error: 'Unauthorized', message: 'No access token provided' }, { status: 401 });
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

