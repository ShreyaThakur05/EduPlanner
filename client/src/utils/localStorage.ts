// Local storage utilities for data persistence
export const saveToLocalStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const getFromLocalStorage = (key: string) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
};

export const removeFromLocalStorage = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

// User-specific storage keys
export const getStorageKey = (userId: string, dataType: string) => {
  return `eduplanner_${userId}_${dataType}`;
};