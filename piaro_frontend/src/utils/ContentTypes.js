export const fetchContentTypeId = async (modelName) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/utils/content_types/');
      const data = await response.json();
      return data[modelName];
    } catch (error) {
      console.error('Error fetching content type ID:', error);
      throw error;
    }
  };
  