import { ApiUsage, ApiLimit } from './Models';

export interface RestClientConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

export class RestClient {
  private config: RestClientConfig;
  private usageHistory: ApiUsage[] = [];

  constructor(config: RestClientConfig) {
    this.config = config;
  }

  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.makeRequest<T>('GET', endpoint, undefined, headers);
  }

  async post<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<T> {
    return this.makeRequest<T>('POST', endpoint, data, headers);
  }

  async put<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<T> {
    return this.makeRequest<T>('PUT', endpoint, data, headers);
  }

  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.makeRequest<T>('DELETE', endpoint, undefined, headers);
  }

  private async makeRequest<T>(
    method: string,
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<T> {
    const startTime = Date.now();
    const url = `${this.config.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: data ? JSON.stringify(data) : undefined,
        signal: AbortSignal.timeout(this.config.timeout)
      });

      const responseTime = Date.now() - startTime;
      const limitInfo = this.extractLimitInfo(response);

      // Record usage
      const usage: ApiUsage = {
        endpoint,
        method,
        timestamp: new Date(),
        responseTime,
        statusCode: response.status,
        limitInfo
      };

      this.usageHistory.push(usage);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Record failed usage
      const usage: ApiUsage = {
        endpoint,
        method,
        timestamp: new Date(),
        responseTime,
        statusCode: 0
      };

      this.usageHistory.push(usage);
      throw error;
    }
  }

  private extractLimitInfo(response: Response): ApiLimit | undefined {
    const limitHeader = response.headers.get('X-RateLimit-Limit');
    const remainingHeader = response.headers.get('X-RateLimit-Remaining');
    const resetHeader = response.headers.get('X-RateLimit-Reset');
    const windowHeader = response.headers.get('X-RateLimit-Window');

    if (limitHeader && remainingHeader && resetHeader) {
      return {
        limit: parseInt(limitHeader),
        remaining: parseInt(remainingHeader),
        resetTime: new Date(parseInt(resetHeader) * 1000),
        windowSize: windowHeader ? parseInt(windowHeader) : 3600
      };
    }

    return undefined;
  }

  getUsageHistory(): ApiUsage[] {
    return [...this.usageHistory];
  }

  getUsageHistoryForEndpoint(endpoint: string): ApiUsage[] {
    return this.usageHistory.filter(usage => usage.endpoint === endpoint);
  }

  clearUsageHistory(): void {
    this.usageHistory = [];
  }
}
