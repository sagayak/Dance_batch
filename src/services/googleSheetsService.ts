import { Batches } from '../types';

// The Google Apps Script URL is now loaded from an environment variable.
// This is crucial for security and deployment on platforms like Vercel.
export const APPS_SCRIPT_URL = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL || '';

interface FetchResponse {
  success: boolean;
  data?: Batches;
  error?: string;
}

interface UpdateResponse {
  success: boolean;
  message?: string;
  updatedDate?: string;
  error?: string;
}

export const isSetupNeeded = (): boolean => {
  return !APPS_SCRIPT_URL;
};

export const fetchData = async (): Promise<Batches> => {
  if (isSetupNeeded()) {
    throw new Error("Setup required. Please configure the Google Apps Script URL environment variable.");
  }
  
  const response = await fetch(APPS_SCRIPT_URL);
  if (!response.ok) {
    throw new Error(`Network response was not ok. Status: ${response.status}`);
  }
  const result: FetchResponse = await response.json();
  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to fetch data.');
  }
  return result.data;
};

export const updatePaymentDate = async (rowIndex: number): Promise<string> => {
  if (isSetupNeeded()) {
    throw new Error("Setup required. Please configure the Google Apps Script URL environment variable.");
  }
  
  const formData = new FormData();
  formData.append('rowIndex', String(rowIndex));

  const response = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Network response was not ok while updating. Status: ${response.status}`);
  }
  
  const result: UpdateResponse = await response.json();
  if (!result.success || !result.updatedDate) {
    throw new Error(result.error || 'Failed to update payment date.');
  }
  return result.updatedDate;
};

export const updatePaymentDateWithValue = async (rowIndex: number, newDate: string): Promise<string> => {
  if (isSetupNeeded()) {
    throw new Error("Setup required. Please configure the Google Apps Script URL environment variable.");
  }

  const formData = new FormData();
  formData.append('rowIndex', String(rowIndex));
  formData.append('newDate', newDate); // Add the new date to the request

  const response = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Network response was not ok while updating. Status: ${response.status}`);
  }

  const result: UpdateResponse = await response.json();
  if (!result.success || !result.updatedDate) {
    throw new Error(result.error || 'Failed to update payment date.');
  }
  return result.updatedDate;
};

export const bulkUpdatePaymentDates = async (rowIndexes: number[]): Promise<string> => {
  if (isSetupNeeded()) {
    throw new Error("Setup required. Please configure the Google Apps Script URL environment variable.");
  }

  const formData = new FormData();
  formData.append('rowIndexes', rowIndexes.join(','));

  const response = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Network response was not ok while updating. Status: ${response.status}`);
  }

  const result: UpdateResponse = await response.json();
  if (!result.success || !result.updatedDate) {
    throw new Error(result.error || 'Failed to update payment dates.');
  }
  return result.updatedDate;
};
