import { apiService } from './api';

interface LoginResponse {
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
  accessToken: string;
  refreshToken: string;
  message: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

class AuthService {
  async login(email: string, password: string): Promise<LoginResponse> {
    // Mock login for demo purposes
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    // Try to get existing user data from registration
    const existingUser = localStorage.getItem('registeredUser');
    let mockUser;
    
    if (existingUser) {
      mockUser = JSON.parse(existingUser);
      // Update email in case it's different
      mockUser.email = email;
      console.log('Using registered user data:', mockUser);
    } else {
      console.log('No registered user found, using default');
      mockUser = {
        id: 1,
        email: email,
        firstName: 'Student',
        lastName: 'User',
      };
    }
    
    const mockResponse: LoginResponse = {
      user: mockUser,
      accessToken: 'mock-access-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
      message: 'Login successful'
    };
    
    // Store user data for getCurrentUser
    localStorage.setItem('currentUser', JSON.stringify(mockUser));
    console.log('Login setting currentUser:', mockUser);
    
    return mockResponse;
  }

  async register(userData: RegisterData): Promise<LoginResponse> {
    // Mock registration for demo purposes
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    const mockUser = {
      id: Date.now(), // Use timestamp as unique ID
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
    };
    
    const mockResponse: LoginResponse = {
      user: mockUser,
      accessToken: 'mock-access-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
      message: 'Registration successful'
    };
    
    // Store user data for both current session and future logins
    localStorage.setItem('currentUser', JSON.stringify(mockUser));
    localStorage.setItem('registeredUser', JSON.stringify(mockUser));
    
    return mockResponse;
  }

  async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      // Ignore logout errors
      console.warn('Logout request failed:', error);
    }
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const response = await apiService.post('/auth/refresh', { refreshToken });
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Token refresh failed');
    }
  }

  async getCurrentUser(): Promise<User> {
    // For demo purposes, return mock user data if token exists
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No access token found');
    }

    // Return current user data
    const currentUserData = localStorage.getItem('currentUser');
    if (currentUserData) {
      return JSON.parse(currentUserData);
    }

    // Default mock user
    return {
      id: 1,
      email: 'user@example.com',
      firstName: 'Student',
      lastName: 'User',
    };
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('accessToken');
    return !!token; // For demo, just check if token exists
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }
}

export const authService = new AuthService();