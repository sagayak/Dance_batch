import { Batches } from '../types';

// IMPORTANT: Replace this with your own deployed Google Apps Script URL.
// See the setup guide in the app for instructions.
// Fix: Added a string type annotation to widen the type from a literal to `string`, which resolves the unintentional comparison error.
export const APPS_SCRIPT_URL: string = "https://script.google.com/macros/s/AKfycbx_3S48De5OrzJHJJQGO-tnFdfHZXw-AmA36EHttjYoTdk1IkJNR_gGq7nbR4kCJwcx/exec";

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
  return APPS_SCRIPT_URL === "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE";
};

export const fetchData = async (): Promise<Batches> => {
  if (isSetupNeeded()) {
    throw new Error("Setup required. Please configure the Google Apps Script URL.");
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
    throw new Error("Setup required. Please configure the Google Apps Script URL.");
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