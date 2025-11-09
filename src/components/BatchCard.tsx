import React, { useState, useEffect, useRef } from 'react';
import { Student } from '../types';
import StudentRow from './StudentRow';

interface BatchCardProps {
  batchName: string;
  students: Student[];
  onUpdatePayment: (rowIndex: number) => Promise<void>;
  onEditPaymentDate: (rowIndex: number, newDate: string) => Promise<void>;
  selectedStudents: Set<number>;
  onToggleSelection: (rowIndex: number) => void;
  onToggleSelectAll: (studentRowIndexes: number[]) => void;
  onBulkUpdate: (rowIndexes: number[]) => Promise<void>;
}

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

const BatchCard: React.FC<BatchCardProps> = ({ 
  batchName, 
  students, 
  onUpdatePayment,
  onEditPaymentDate, 
  selectedStudents, 
  onToggleSelection, 
  onToggleSelectAll,
  onBulkUpdate
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

  const studentRowIndexesInBatch = students.map(s => s.rowIndex);
  const selectedInBatch = studentRowIndexesInBatch.filter(id => selectedStudents.has(id));
  const selectedCount = selectedInBatch.length;

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      const isIndeterminate = selectedCount > 0 && selectedCount < students.length;
      selectAllCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [selectedCount, students.length]);

  const handleBulkUpdateClick = async () => {
    if (isBulkUpdating || selectedCount === 0) return;
    setIsBulkUpdating(true);
    try {
      await onBulkUpdate(selectedInBatch);
    } catch (error) {
      console.error("Failed to bulk update payments:", error);
      alert("Could not update payments for selected students.");
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const sortedStudents = [...students].sort((a, b) => {
    const aIsOverdue = isOverdue(a.lastPaymentDate);
    const bIsOverdue = isOverdue(b.lastPaymentDate);

    if (aIsOverdue && !bIsOverdue) return -1;
    if (!aIsOverdue && bIsOverdue) return 1;
    
    return a.name.localeCompare(b.name);
  });
  
  const overdueCount = students.filter(s => isOverdue(s.lastPaymentDate)).length;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-shadow hover:shadow-xl">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 bg-gradient-to-r from-pink-500 to-violet-500 flex justify-between items-center text-left hover:opacity-95 transition-opacity cursor-pointer"
        aria-expanded={isOpen}
        aria-controls={`batch-content-${batchName}`}
      >
        <div>
            <h2 className="text-xl font-bold text-white tracking-wider">{batchName}</h2>
            <span className="text-sm text-pink-100">{students.length} student{students.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center space-x-4">
            {overdueCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">{overdueCount} Overdue</span>
            )}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`text-white transform transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
            >
            <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
        </div>
      </div>
      {isOpen && (
        <div className="p-3 bg-gray-50 border-b border-t flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input
              ref={selectAllCheckboxRef}
              type="checkbox"
              id={`select-all-${batchName}`}
              className="h-5 w-5 rounded border-gray-400 text-violet-600 focus:ring-violet-500"
              checked={selectedCount === students.length && students.length > 0}
              onChange={() => onToggleSelectAll(studentRowIndexesInBatch)}
              onClick={(e) => e.stopPropagation()}
              disabled={students.length === 0}
            />
            <label htmlFor={`select-all-${batchName}`} className="text-sm font-medium text-gray-700">
              {selectedCount > 0 ? `${selectedCount} selected` : "Select All"}
            </label>
          </div>
          {selectedCount > 0 && (
            <button
              onClick={handleBulkUpdateClick}
              disabled={isBulkUpdating}
              className="bg-green-500 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all disabled:bg-gray-400 disabled:cursor-wait"
            >
              {isBulkUpdating ? 'Updating...' : `Mark ${selectedCount} as Paid`}
            </button>
          )}
        </div>
      )}
      <div
        id={`batch-content-${batchName}`}
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-[3000px]' : 'max-h-0'
        }`}
      >
        <div className="divide-y divide-gray-200">
          {sortedStudents.length > 0 ? (
            sortedStudents.map(student => (
              <StudentRow 
                key={student.rowIndex} 
                student={student} 
                onUpdatePayment={onUpdatePayment}
                onEditPaymentDate={onEditPaymentDate} 
                isSelected={selectedStudents.has(student.rowIndex)}
                onToggleSelection={onToggleSelection}
              />
            ))
          ) : (
            <p className="p-4 text-center text-gray-500">No students in this batch.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchCard;
