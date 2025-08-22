export const API_BASE_URL = "http://localhost:5014";

export async function fetchApi<T = unknown>(
    endpoint: string,
    options?: RequestInit
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
        ...options,
        credentials: 'include', // Include cookies in all API requests
    };

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            try {
                const errorData = await response.json();
                throw new Error(errorData.message || `API Error: ${response.status}`);
            } catch {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }
        }

        if (response.status === 204) {
            return undefined as unknown as T;
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const text = await response.text();
            if (!text) {
                throw new Error("API returned an empty JSON response.");
            }
            return JSON.parse(text);
        }
        
        const text = await response.text();
        return text as unknown as T;

    } catch (error) {
        console.error("API request failed:", error);
        throw error;
    }
}

export async function downloadApi(
    endpoint: string,
    options?: RequestInit
): Promise<Blob> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
        ...options,
        credentials: 'include', // Include cookies in all API requests
    };

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            try {
                const errorData = await response.json();
                throw new Error(errorData.message || `API Error: ${response.status}`);
            } catch {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/octet-stream')) {
            return await response.blob();
        } else {
            throw new Error("Expected application/octet-stream, but received " + contentType);
        }

    } catch (error) {
        console.error("Download API request failed:", error);
        throw error;
    }
}
