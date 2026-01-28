import 'server-only';
import { CACHE_REVALIDATE_SECONDS } from "@/lib/constants";

export interface APIClientConfig {
    baseUrl: string;
    defaultHeaders?: Record<string, string>;
    revalidateSeconds?: number;
    prepareRequest?: () => Promise<{ headers?: Record<string, string> }>;
}

export interface RequestOptions {
    endpoint: string;
    method?: 'GET' | 'POST';
    body?: string;
    params?: Record<string, string>;
    headers?: Record<string, string>;
}

/**
 * Creates a type-safe API client with built-in caching and error handling.
 * This factory enables adding new source APIs with minimal boilerplate.
 */
export function createAPIClient(config: APIClientConfig) {
    const {
        baseUrl,
        defaultHeaders = { 'Accept': 'application/json' },
        revalidateSeconds = CACHE_REVALIDATE_SECONDS,
        prepareRequest = async (): Promise<{ headers?: Record<string, string> }> => ({})
    } = config;

    return async function fetchAPI<T>(options: RequestOptions): Promise<T> {
        const { endpoint, method = 'GET', body, params, headers } = options;
        const prepared = await prepareRequest();

        let url = `${baseUrl}${endpoint}`;
        if (params) {
            const queryParams = new URLSearchParams(params);
            url += `?${queryParams.toString()}`;
        }

        const response = await fetch(url, {
            method,
            headers: {
                ...defaultHeaders,
                ...prepared.headers,
                ...headers
            },
            body,
            next: { revalidate: revalidateSeconds }
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(
                `API Error [${baseUrl}]: ${response.status} ${response.statusText} - ${errorBody}`
            );
        }

        return response.json();
    };
}
