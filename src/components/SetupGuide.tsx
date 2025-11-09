import React from 'react';

const appsScriptCode = `
const SHEET_NAME = "Sheet1"; // Make sure your sheet/tab name is "Sheet1" or change this

// Column mapping (1-based index) - A=1, B=2, C=3, etc.
const BATCH_COL = 1;
const NAME_COL = 2;
const PAYMENT_DATE_COL = 3;
const PHONE_COL = 4;
const PARENT_NAME_COL = 5;

// IMPORTANT: This function adds a CORS header to allow requests from any origin.
// This is necessary for the app to work when deployed on Vercel.
function setCorsHeaders(output) {
  return output.withHeaders({'Access-Control-Allow-Origin': '*'});
}

function doGet(e) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    if (!sheet) {
        throw new Error("Sheet '" + SHEET_NAME + "' not found.");
    }
    const data = sheet.getDataRange().getValues();
    const headers = data.shift(); // Remove header row

    const studentsByBatch = {};
    const spreadsheetTimeZone = spreadsheet.getSpreadsheetTimeZone();

    data.forEach((row, index) => {
      const batch = row[BATCH_COL - 1];
      if (!batch) return; // Skip rows without a batch

      const paymentDateValue = row[PAYMENT_DATE_COL - 1];
      let formattedDate = paymentDateValue;
      if (paymentDateValue instanceof Date) {
        formattedDate = Utilities.formatDate(paymentDateValue, spreadsheetTimeZone, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
      }

      const student = {
        rowIndex: index + 2, 
        name: row[NAME_COL - 1],
        lastPaymentDate: formattedDate,
        phone: row[PHONE_COL - 1] || null,
        parentName: row[PARENT_NAME_COL - 1] || null,
      };

      if (!studentsByBatch[batch]) {
        studentsByBatch[batch] = [];
      }
      studentsByBatch[batch].push(student);
    });

    const jsonOutput = ContentService
      .createTextOutput(JSON.stringify({ success: true, data: studentsByBatch }))
      .setMimeType(ContentService.MMimeType.JSON);
    
    return setCorsHeaders(jsonOutput);

  } catch (error) {
    const errorOutput = ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
    return setCorsHeaders(errorOutput);
  }
}

function doPost(e) {
  try {
    const { rowIndex, rowIndexes, newDate } = e.parameter;
    
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
        throw new Error("Sheet '" + SHEET_NAME + "' not found.");
    }
    
    // Use the provided newDate, or default to today's date.
    const dateToSet = newDate ? newDate : new Date();

    if (rowIndexes) {
      // Handle bulk update
      const indexesToUpdate = rowIndexes.split(',');
      if (indexesToUpdate.length === 0) {
        throw new Error("No row indexes provided for bulk update.");
      }
      indexesToUpdate.forEach(idx => {
        sheet.getRange(parseInt(idx, 10), PAYMENT_DATE_COL).setValue(dateToSet);
      });
    } else if (rowIndex) {
      // Handle single update
      sheet.getRange(parseInt(rowIndex, 10), PAYMENT_DATE_COL).setValue(dateToSet);
    } else {
      throw new Error("Row index or indexes are required for update.");
    }
    
    // Format the response date consistently
    const formattedResponseDate = Utilities.formatDate(new Date(dateToSet), "GMT", "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

    const jsonOutput = ContentService
      .createTextOutput(JSON.stringify({ success: true, message: "Payment date(s) updated.", updatedDate: formattedResponseDate }))
      .setMimeType(ContentService.MimeType.JSON);

    return setCorsHeaders(jsonOutput);

  } catch (error) {
    const errorOutput = ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
    return setCorsHeaders(errorOutput);
  }
}
`.trim();

const SetupGuide: React.FC = () => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(appsScriptCode).then(() => {
      alert('Code copied to clipboard!');
    }, () => {
      alert('Failed to copy code.');
    });
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg max-w-4xl mx-auto my-8">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-red-500">Action Required: Setup Backend</h1>
        <p className="mt-2 text-gray-600">This app needs to connect to a Google Sheet. Follow these steps to set it up.</p>
      </div>

      <div className="space-y-6 text-gray-700">
        <div>
          <h2 className="text-xl font-semibold mb-2">Step 1: Create Your Google Sheet</h2>
          <p>Create a new Google Sheet. The first row must be the headers exactly as follows:</p>
          <div className="mt-2 p-3 bg-gray-100 rounded-md text-sm font-mono">
            <span className="font-bold">Column A:</span> Batch<br/>
            <span className="font-bold">Column B:</span> Student Name<br/>
            <span className="font-bold">Column C:</span> Last Bill Payment Date<br/>
            <span className="font-bold">Column D:</span> Phone Number<br/>
            <span className="font-bold">Column E:</span> Parent Name
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Step 2: Create a Google Apps Script</h2>
          <ul className="list-disc list-inside space-y-1 pl-4">
            <li>In your Google Sheet, go to <span className="font-semibold">Extensions &gt; Apps Script</span>.</li>
            <li>Delete any boilerplate code in the editor.</li>
            <li>Copy the code below and paste it into the editor. <span className="font-bold text-red-600">(Note: The backend script is updated to handle date edits.)</span></li>
          </ul>
          <div className="mt-3 relative">
            <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto text-sm">
              <code>{appsScriptCode}</code>
            </pre>
            <button onClick={copyToClipboard} className="absolute top-2 right-2 bg-gray-600 hover:bg-gray-500 text-white text-xs font-bold py-1 px-2 rounded">
              Copy Code
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Step 3: Deploy the Script</h2>
          <ul className="list-disc list-inside space-y-1 pl-4">
            <li>Click the <span className="font-semibold">"Deploy"</span> button (top right) and select <span className="font-semibold">"New deployment"</span>.</li>
            <li>Click the gear icon next to "Select type" and choose <span className="font-semibold">"Web app"</span>.</li>
            <li>For <span className="font-semibold">"Who has access"</span>, select <span className="font-semibold">"Anyone"</span>. This is crucial for the app to work.</li>
            <li>Click <span className="font-semibold">"Deploy"</span>. Authorize the script with your Google account when prompted.</li>
            <li>Copy the generated <span className="font-semibold">Web app URL</span>. You will need this for Vercel.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Step 4: Deploy to Vercel</h2>
          <p>
            After setting up your project on Vercel, go to your project's settings and add an Environment Variable:
          </p>
          <div className="mt-2 p-3 bg-gray-100 rounded-md font-mono text-sm">
            <span className="font-bold">Name:</span> VITE_GOOGLE_APPS_SCRIPT_URL<br />
            <span className="font-bold">Value:</span> [Paste the Web app URL you copied in Step 3 here]
          </div>
          <p className="mt-2">After adding the environment variable, re-deploy your project on Vercel for the changes to take effect.</p>
        </div>
      </div>
    </div>
  );
};

export default SetupGuide;
