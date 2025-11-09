import React, { useState, useRef, useEffect } from 'react';
import { Student } from '../types';

interface StudentRowProps {
  student: Student;
  onUpdatePayment: (rowIndex: number) => Promise<void>;
  onEditPaymentDate: (rowIndex: number, newDate: string) => Promise<void>;
  isSelected: boolean;
  onToggleSelection: (rowIndex: number) => void;
}

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);

const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
);

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 group-hover:opacity-100 transition-opacity"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
);

const isOverdue = (dateString: string): boolean => {
  if (!dateString) return true;

  const paymentDate = new Date(dateString);
  if (isNaN(paymentDate.getTime())) return false;

  const today = new Date();
  const firstOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  return paymentDate < firstOfCurrentMonth;
};

const formatDateForDisplay = (dateString: string): string => {
  if (!dateString || dateString === 'N/A' || dateString === 'Updating...') {
    return dateString || 'N/A';
  }
  try {
    const date = new Date(dateString.includes('T') ? dateString : `${dateString}T00:00:00Z`);
    if (isNaN(date.getTime())) throw new Error("Invalid date parsed");
    
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata',
    };
    return new Intl.DateTimeFormat('en-GB', options).format(date).replace(/ /g, '-');
  } catch (e) {
    console.error("Could not format date:", dateString, e);
    return dateString;
  }
};

const formatDateForInput = (dateString: string): string => {
  if (!dateString || isNaN(new Date(dateString).getTime())) return '';
  try {
    const date = new Date(dateString.includes('T') ? dateString : `${dateString}T00:00:00Z`);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
};

const StudentRow: React.FC<StudentRowProps> = ({ student, onUpdatePayment, onEditPaymentDate, isSelected, onToggleSelection }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingDate) {
      dateInputRef.current?.focus();
    }
  }, [isEditingDate]);

  const isPaidState = student.lastPaymentDate !== 'Updating...';
  const paymentIsOverdue = isPaidState && isOverdue(student.lastPaymentDate);

  const handleUpdate = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
  
  const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setIsEditingDate(false);
    
    if (!newDate || newDate === formatDateForInput(student.lastPaymentDate)) {
        return;
    }
    
    try {
        await onEditPaymentDate(student.rowIndex, newDate);
    } catch(error) {
        alert("Could not update date. Please try again.");
    }
  };

  const getRowStyle = () => {
    if (isSelected) return 'bg-blue-100 border-blue-300';
    if (!isPaidState) return 'bg-yellow-50 border-yellow-200';
    if (paymentIsOverdue) return 'bg-red-50 hover:bg-red-100 border-red-200';
    return 'bg-green-50 hover:bg-green-100 border-green-200';
  };

  const getDateStyle = () => {
    if (!isPaidState) return 'text-yellow-700 font-bold';
    if (paymentIsOverdue) return 'text-red-700 font-bold';
    return 'text-green-700 font-bold';
  };
  
  return (
    <div 
      className={`flex items-center p-4 border-b last:border-b-0 transition-colors duration-200 cursor-pointer ${getRowStyle()}`}
      onClick={() => onToggleSelection(student.rowIndex)}
    >
      <div className="mr-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelection(student.rowIndex)}
          onClick={(e) => e.stopPropagation()}
          className="h-5 w-5 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
        />
      </div>
      <div className="flex-grow">
        <p className="font-semibold text-gray-800 text-lg">{student.name}</p>
        <div className="flex flex-wrap items-center text-sm text-gray-500 mt-1 gap-x-4 gap-y-1">
          {student.parentName && ( <span className="flex items-center gap-1.5"><UserIcon /> {student.parentName}</span> )}
          {student.phone && ( <span className="flex items-center gap-1.5"><PhoneIcon /> {student.phone}</span> )}
        </div>
      </div>
      <div className="flex items-center space-x-4 ml-4">
        <div className="text-center hidden sm:block">
            <p className="text-xs text-gray-500">Last Paid</p>
            {isEditingDate ? (
                <input
                    ref={dateInputRef}
                    type="date"
                    defaultValue={formatDateForInput(student.lastPaymentDate)}
                    onChange={handleDateChange}
                    onBlur={() => setIsEditingDate(false)}
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 rounded border-violet-300 focus:ring-violet-500 focus:border-violet-500"
                />
            ) : (
                <div onClick={(e) => { e.stopPropagation(); setIsEditingDate(true); }} className={`group font-medium flex items-center gap-1.5 cursor-pointer p-1 rounded ${getDateStyle()}`}>
                    <span>{formatDateForDisplay(student.lastPaymentDate)}</span>
                    <EditIcon />
                </div>
            )}
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
