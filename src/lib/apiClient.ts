
const API_BASE_URL = "http://localhost:5014";

export async function fetchApi(
    endpoint: string,
    options?: RequestInit
) {
    const url = `${API_BASE_URL}${endpoint}`;
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `API error: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("API request failed:", error);
        throw error;
    }
}
