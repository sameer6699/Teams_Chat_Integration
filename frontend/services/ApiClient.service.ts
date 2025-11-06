/**
 * API Client Service
 * Centralized HTTP client for API requests
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class ApiClientService {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add any auth tokens or headers here if needed
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        // Handle common errors
        if (error.response?.status === 401) {
          // Handle unauthorized - redirect to login
          console.error('Unauthorized access');
        } else if (error.response?.status === 500) {
          console.error('Server error:', error.response.data);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * GET request
   */
  async get<T>(url: string, config?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  /**
   * POST request
   */
  async post<T>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  /**
   * PATCH request
   */
  async patch<T>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  /**
   * PUT request
   */
  async put<T>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string, config?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  /**
   * Handle errors
   */
  private handleError<T>(error: unknown): ApiResponse<T> {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiResponse<T>>;
      return {
        success: false,
        error: axiosError.response?.data?.error || 'Request failed',
        message: axiosError.response?.data?.message || axiosError.message,
      };
    }

    return {
      success: false,
      error: 'Unknown error',
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

// Export singleton instance
export const apiClient = new ApiClientService();

