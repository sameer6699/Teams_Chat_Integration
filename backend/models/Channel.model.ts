/**
 * Channel Model
 * Represents Microsoft Teams channel data structure
 */

export interface IChannel {
  id: string;
  displayName: string;
  description?: string;
  email?: string;
  webUrl?: string;
  membershipType?: 'standard' | 'private' | 'shared' | 'public';
  teamId: string;
  teamName?: string;
  createdDateTime?: string;
  isFavoriteByDefault?: boolean;
}

export class ChannelModel implements IChannel {
  id: string;
  displayName: string;
  description?: string;
  email?: string;
  webUrl?: string;
  membershipType?: 'standard' | 'private' | 'shared' | 'public';
  teamId: string;
  teamName?: string;
  createdDateTime?: string;
  isFavoriteByDefault?: boolean;

  constructor(data: IChannel) {
    this.id = data.id;
    this.displayName = data.displayName;
    this.description = data.description;
    this.email = data.email;
    this.webUrl = data.webUrl;
    this.membershipType = data.membershipType;
    this.teamId = data.teamId;
    this.teamName = data.teamName;
    this.createdDateTime = data.createdDateTime;
    this.isFavoriteByDefault = data.isFavoriteByDefault;
  }

  /**
   * Validate channel data
   */
  static validate(data: Partial<IChannel>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.id) errors.push('Channel ID is required');
    if (!data.displayName) errors.push('Display name is required');
    if (!data.teamId) errors.push('Team ID is required');

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Transform Graph API channel to Channel model
   */
  static fromGraphApi(graphChannel: any, teamId: string, teamName?: string): ChannelModel {
    return new ChannelModel({
      id: graphChannel.id,
      displayName: graphChannel.displayName || graphChannel.name || 'Unnamed Channel',
      description: graphChannel.description,
      email: graphChannel.email,
      webUrl: graphChannel.webUrl,
      membershipType: graphChannel.membershipType,
      teamId: teamId,
      teamName: teamName,
      createdDateTime: graphChannel.createdDateTime,
      isFavoriteByDefault: graphChannel.isFavoriteByDefault,
    });
  }

  /**
   * Convert to JSON
   */
  toJSON(): IChannel {
    return {
      id: this.id,
      displayName: this.displayName,
      description: this.description,
      email: this.email,
      webUrl: this.webUrl,
      membershipType: this.membershipType,
      teamId: this.teamId,
      teamName: this.teamName,
      createdDateTime: this.createdDateTime,
      isFavoriteByDefault: this.isFavoriteByDefault,
    };
  }
}
