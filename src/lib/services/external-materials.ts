/**
 * Service to aggregate educational materials from multiple external APIs.
 * Includes YouTube (Video), Google Books/Open Library (Books), arXiv/Crossref (Articles).
 */

export interface ExternalMaterial {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'article' | 'book';
  url: string;
  source: string;
  thumbnail?: string;
  author?: string;
  publishedAt?: string;
}

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;

/**
 * YouTube Data API v3 Search
 */
async function searchYouTube(query: string): Promise<ExternalMaterial[]> {
  if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY.includes('your_key_here')) {
    console.warn("YouTube API Key missing or placeholder. Skipping YouTube search.");
    return [];
  }

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=5&key=${YOUTUBE_API_KEY}`
    );
    const data = await res.json();
    
    if (data.error) throw new Error(data.error.message);

    return (data.items || []).map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      type: 'video',
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      source: 'YouTube',
      thumbnail: item.snippet.thumbnails?.medium?.url,
      author: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
    }));
  } catch (error) {
    console.error("YouTube API error:", error);
    return [];
  }
}

/**
 * Google Books API
 */
async function searchGoogleBooks(query: string): Promise<ExternalMaterial[]> {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5${GOOGLE_BOOKS_API_KEY && !GOOGLE_BOOKS_API_KEY.includes('key_here') ? `&key=${GOOGLE_BOOKS_API_KEY}` : ''}`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    
    return (data.items || []).map((item: any) => ({
      id: item.id,
      title: item.volumeInfo.title,
      description: item.volumeInfo.description || item.searchInfo?.textSnippet || "No description available.",
      type: 'book',
      url: item.volumeInfo.infoLink,
      source: 'Google Books',
      thumbnail: item.volumeInfo.imageLinks?.thumbnail,
      author: item.volumeInfo.authors?.join(', '),
      publishedAt: item.volumeInfo.publishedDate,
    }));
  } catch (error) {
    console.error("Google Books API error:", error);
    return [];
  }
}

/**
 * Open Library API (Alternative for Books)
 */
async function searchOpenLibrary(query: string): Promise<ExternalMaterial[]> {
  try {
    const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=5`);
    const data = await res.json();
    
    return (data.docs || []).map((item: any) => ({
      id: item.key,
      title: item.title,
      description: `Author(s): ${item.author_name?.join(', ') || 'Unknown'}. First published: ${item.first_publish_year || 'N/A'}.`,
      type: 'book',
      url: `https://openlibrary.org${item.key}`,
      source: 'Open Library',
      author: item.author_name?.join(', '),
    }));
  } catch (error) {
    console.error("Open Library API error:", error);
    return [];
  }
}

/**
 * arXiv API (Articles/Research)
 */
async function searchArxiv(query: string): Promise<ExternalMaterial[]> {
  try {
    const res = await fetch(`https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&max_results=5`);
    const text = await res.text();
    
    // Simple regex parsing for XML (avoiding heavy XML libraries for now)
    const entries = text.split('<entry>').slice(1);
    
    return entries.map((entry, idx) => {
      const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1].trim() || "Untitled";
      const summary = entry.match(/<summary>([\s\S]*?)<\/summary>/)?.[1].trim() || "";
      const id = entry.match(/<id>([\s\S]*?)<\/id>/)?.[1].trim() || idx.toString();
      
      return {
        id,
        title,
        description: summary.substring(0, 200) + '...',
        type: 'article',
        url: id,
        source: 'arXiv',
      };
    });
  } catch (error) {
    console.error("arXiv API error:", error);
    return [];
  }
}

/**
 * Crossref API (Research Metadata)
 */
async function searchCrossref(query: string): Promise<ExternalMaterial[]> {
  try {
    const res = await fetch(`https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=5`);
    const data = await res.json();
    
    return (data.message?.items || []).map((item: any) => ({
      id: item.DOI,
      title: item.title?.[0] || "Untitled Research",
      description: `Journal: ${item['container-title']?.[0] || 'Unknown'}. Publisher: ${item.publisher || 'N/A'}.`,
      type: 'article',
      url: item.URL || `https://doi.org/${item.DOI}`,
      source: 'Crossref',
      author: item.author?.map((a: any) => `${a.given} ${a.family}`).join(', '),
      publishedAt: item.created?.['date-time']
    }));
  } catch (error) {
    console.error("Crossref API error:", error);
    return [];
  }
}

/**
 * Unified search across all enabled external sources
 */
export async function searchAllExternalSources(query: string): Promise<ExternalMaterial[]> {
  if (!query || query.length < 3) return [];

  const results = await Promise.all([
    searchYouTube(query),
    searchGoogleBooks(query),
    searchOpenLibrary(query),
    searchArxiv(query),
    searchCrossref(query),
  ]);

  // Flatten and shuffle/sort results
  return results.flat().sort(() => Math.random() - 0.5);
}
