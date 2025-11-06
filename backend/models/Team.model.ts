/**
 * Team Model
 * Represents Microsoft Teams team data structure
 */

export interface ITeam {
  id: string;
  displayName: string;
  description?: string;
  createdDateTime: string;
  webUrl: string;
  visibility?: 'private' | 'public';
  memberCount?: number;
}

export class TeamModel implements ITeam {
  id: string;
  displayName: string;
  description?: string;
  createdDateTime: string;
  webUrl: string;
  visibility?: 'private' | 'public';
  memberCount?: number;

  constructor(data: ITeam) {
    this.id = data.id;
    this.displayName = data.displayName;
    this.description = data.description;
    this.createdDateTime = data.createdDateTime;
    this.webUrl = data.webUrl;
    this.visibility = data.visibility;
    this.memberCount = data.memberCount;
  }

  /**
   * Validate team data
   */
  static validate(data: Partial<ITeam>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.id) errors.push('Team ID is required');
    if (!data.displayName) errors.push('Display name is required');
    if (!data.createdDateTime) errors.push('Created date time is required');

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Transform Graph API team to Team model
   */
  static fromGraphApi(graphTeam: any): TeamModel {
    return new TeamModel({
      id: graphTeam.id,
      displayName: graphTeam.displayName,
      description: graphTeam.description,
      createdDateTime: graphTeam.createdDateTime,
      webUrl: graphTeam.webUrl,
      visibility: graphTeam.visibility,
      memberCount: graphTeam.memberCount,
    });
  }

  /**
   * Convert to JSON
   */
  toJSON(): ITeam {
    return {
      id: this.id,
      displayName: this.displayName,
      description: this.description,
      createdDateTime: this.createdDateTime,
      webUrl: this.webUrl,
      visibility: this.visibility,
      memberCount: this.memberCount,
    };
  }
}

