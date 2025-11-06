/**
 * User Model
 * Represents user data structure and validation
 */

export interface IUser {
  id: string;
  displayName: string;
  mail: string;
  userPrincipalName: string;
  jobTitle?: string;
  officeLocation?: string;
  avatar?: string;
  status?: 'online' | 'away' | 'busy' | 'offline';
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserModel implements IUser {
  id: string;
  displayName: string;
  mail: string;
  userPrincipalName: string;
  jobTitle?: string;
  officeLocation?: string;
  avatar?: string;
  status?: 'online' | 'away' | 'busy' | 'offline';
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data: IUser) {
    this.id = data.id;
    this.displayName = data.displayName;
    this.mail = data.mail;
    this.userPrincipalName = data.userPrincipalName;
    this.jobTitle = data.jobTitle;
    this.officeLocation = data.officeLocation;
    this.avatar = data.avatar;
    this.status = data.status || 'offline';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Validate user data
   */
  static validate(data: Partial<IUser>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.id) errors.push('User ID is required');
    if (!data.displayName) errors.push('Display name is required');
    if (!data.mail && !data.userPrincipalName) {
      errors.push('Either mail or userPrincipalName is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Transform Graph API user to User model
   */
  static fromGraphApi(graphUser: any): UserModel {
    return new UserModel({
      id: graphUser.id,
      displayName: graphUser.displayName,
      mail: graphUser.mail || graphUser.userPrincipalName,
      userPrincipalName: graphUser.userPrincipalName,
      jobTitle: graphUser.jobTitle,
      officeLocation: graphUser.officeLocation,
      avatar: graphUser.avatar || undefined,
      status: 'offline',
    });
  }

  /**
   * Convert to JSON
   */
  toJSON(): IUser {
    return {
      id: this.id,
      displayName: this.displayName,
      mail: this.mail,
      userPrincipalName: this.userPrincipalName,
      jobTitle: this.jobTitle,
      officeLocation: this.officeLocation,
      avatar: this.avatar,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

