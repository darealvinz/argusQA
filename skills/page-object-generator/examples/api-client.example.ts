interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  userId: string;
  email: string;
  token: string;
  refreshToken: string;
}

export class AuthApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async login(credentials: LoginRequest): Promise<Response> {
    return fetch(`${this.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
  }

  async getProfile(token: string): Promise<Response> {
    return fetch(`${this.baseUrl}/api/user/profile`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
  }
}
