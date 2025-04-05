import axios from 'axios'

// Getting base URL from .env file
const baseURL = process.env.REACT_APP_API_URL

// Async function to fetch articles based on a search query
export async function fetchArticles(query: string): Promise<any[]> {
    const response = await fetch(`${baseURL}/search?query=${encodeURIComponent(query)}`)
    // If the response is not OK (e.g., 404 or 500), throw an error
    if (!response.ok) {
		const errorText = await response.text()
		throw new Error(`API fetch failed: ${response.status} ${errorText}`)
    }
    //Parsing the response
    const data = await response.json()
    //Returing the search results
    return data.results || data
}
  