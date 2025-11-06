/**
 * Project Model
 * Represents project/chat project data structure
 */

export interface IProject {
  id: string;
  name: string;
  status: string;
  client?: string;
  owner?: string;
  team?: string;
  eta?: string;
  detail: string;
  unreadCount: number;
  tag: string;
  isSelected?: boolean;
  chatId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ProjectModel implements IProject {
  id: string;
  name: string;
  status: string;
  client?: string;
  owner?: string;
  team?: string;
  eta?: string;
  detail: string;
  unreadCount: number;
  tag: string;
  isSelected?: boolean;
  chatId?: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data: IProject) {
    this.id = data.id;
    this.name = data.name;
    this.status = data.status;
    this.client = data.client;
    this.owner = data.owner;
    this.team = data.team;
    this.eta = data.eta;
    this.detail = data.detail;
    this.unreadCount = data.unreadCount || 0;
    this.tag = data.tag;
    this.isSelected = data.isSelected || false;
    this.chatId = data.chatId;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Validate project data
   */
  static validate(data: Partial<IProject>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.id) errors.push('Project ID is required');
    if (!data.name) errors.push('Project name is required');
    if (!data.status) errors.push('Status is required');
    if (!data.detail) errors.push('Detail is required');
    if (!data.tag) errors.push('Tag is required');

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Convert to JSON
   */
  toJSON(): IProject {
    return {
      id: this.id,
      name: this.name,
      status: this.status,
      client: this.client,
      owner: this.owner,
      team: this.team,
      eta: this.eta,
      detail: this.detail,
      unreadCount: this.unreadCount,
      tag: this.tag,
      isSelected: this.isSelected,
      chatId: this.chatId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

