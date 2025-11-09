import React, { useState } from 'react';
import { Student } from '../types';

interface StudentRowProps {
  student: Student;
  onUpdatePayment: (rowIndex: number) => Promise<void>;
}

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);

const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
);

const isOverdue = (dateString: string): boolean => {
  if (!dateString) return true; // No payment date is considered overdue

  const paymentDate = new Date(dateString);
  if (isNaN(paymentDate.getTime())) {
      return false; // Don't mark invalid dates as overdue
  }

  const today = new Date();
  const firstOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  return paymentDate < firstOfCurrentMonth;
};

const formatDateForDisplay = (dateString: string): string => {
  if (!dateString || dateString === 'N/A' || dateString === 'Updating...') {
    return dateString || 'N/A';
  }
  try {
    let date;
    // Handle both "2025-10-31" and full ISO strings like "2025-10-31T18:30:00.000Z"
    if (dateString.includes('T')) {
      date = new Date(dateString); // It's a full ISO string, parse directly.
    } else {
      // It's a date-only string, treat as UTC to prevent timezone shifts.
      date = new Date(`${dateString}T00:00:00Z`);
    }

    if (isNaN(date.getTime())) {
      throw new Error("Invalid date parsed");
    }

    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Kolkata', // Set the timezone to Indian Standard Time.
    };
    // Format to "DD Mon YYYY" and replace spaces with hyphens for "DD-Mon-YYYY".
    return new Intl.DateTimeFormat('en-GB', options).format(date).replace(/ /g, '-');
  } catch (e) {
    console.error("Could not format date:", dateString, e);
    return dateString; // Return original string if formatting fails.
  }
};


const StudentRow: React.FC<StudentRowProps> = ({ student, onUpdatePayment }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const isPaidState = student.lastPaymentDate !== 'Updating...';
  const paymentIsOverdue = isPaidState && isOverdue(student.lastPaymentDate);

  const handleUpdate = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      await onUpdatePayment(student.rowIndex);
    } catch (error) {
      console.error("Failed to update payment:", error);
      alert("Could not update payment. Please check your connection and setup.");
    } finally {
      setIsUpdating(false);
    }
  };

  const getRowStyle = () => {
    if (!isPaidState) return 'bg-yellow-50 border-yellow-200'; // Updating state
    if (paymentIsOverdue) return 'bg-red-50 hover:bg-red-100 border-red-200';
    return 'bg-green-50 hover:bg-green-100 border-green-200';
  };

  const getDateStyle = () => {
    if (!isPaidState) return 'text-yellow-700 font-bold'; // Updating state
    if (paymentIsOverdue) return 'text-red-700 font-bold';
    return 'text-green-700 font-bold';
  };
  
  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b last:border-b-0 transition-colors duration-200 ${getRowStyle()}`}
    >
      <div className="flex-grow mb-3 sm:mb-0">
        <p className="font-semibold text-gray-800 text-lg">{student.name}</p>
        <div className="flex flex-wrap items-center text-sm text-gray-500 mt-1 gap-x-4 gap-y-1">
          {student.parentName && (
            <span className="flex items-center gap-1.5"><UserIcon /> {student.parentName}</span>
          )}
          {student.phone && (
            <span className="flex items-center gap-1.5"><PhoneIcon /> {student.phone}</span>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-4 w-full sm:w-auto">
        <div className="text-center">
            <p className="text-xs text-gray-500">Last Paid</p>
            <p className={`font-medium ${getDateStyle()}`}>
              {formatDateForDisplay(student.lastPaymentDate)}
            </p>
        </div>
        <button
          onClick={handleUpdate}
          disabled={isUpdating}
          className="w-full sm:w-auto bg-green-500 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all disabled:bg-gray-400 disabled:cursor-wait"
        >
          {isUpdating ? 'Updating...' : 'Mark as Paid'}
        </button>
      </div>
    </div>
  );
};

export default StudentRow;