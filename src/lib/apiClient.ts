
const API_BASE_URL = "http://localhost:5014";

export async function fetchApi<T = any>(
    endpoint: string,
    options?: RequestInit
): Promise<T | null> { // Allow for null response for empty bodies
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
            } catch (e) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }
        }

        // Handle successful responses
        const text = await response.text();
        if (text) {
            return JSON.parse(text) as T;
        }

        // If the response body is empty, return null to signify success without data.
        return null;

    } catch (error) {
        console.error("API request failed:", error);
        throw error;
    }
}
