let contentTypeCache = null;

export const fetchContentTypeId = async (modelName) => {
  try {
    // Use cached content types if available
    if (!contentTypeCache) {
      const response = await fetch('http://127.0.0.1:8000/utils/content_types/');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      contentTypeCache = await response.json();
    }

    const contentTypeId = contentTypeCache[modelName.toLowerCase()];
    if (!contentTypeId) {
      throw new Error(`Content type not found for model: ${modelName}`);
    }
    
    return contentTypeId;
  } catch (error) {
    console.error('Error fetching content type ID:', error);
    // Provide fallback for common content types if API fails
    const fallbackTypes = {
      publication: 9,
      user: 7,
      community: 8,
      comment: 10
    };
    return fallbackTypes[modelName.toLowerCase()] || null;
  }
};

// Prefetch all content types (optional)
export const prefetchContentTypes = async () => {
  try {
    const response = await fetch('http://127.0.0.1:8000/utils/content_types/');
    contentTypeCache = await response.json();
  } catch (error) {
    console.error('Prefetch failed:', error);
  }
};