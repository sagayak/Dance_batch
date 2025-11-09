
import React, { useState } from 'react';
import { Student } from '../types';
import StudentRow from './StudentRow';

interface BatchCardProps {
  batchName: string;
  students: Student[];
  onUpdatePayment: (rowIndex: number) => Promise<void>;
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

const BatchCard: React.FC<BatchCardProps> = ({ batchName, students, onUpdatePayment }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const sortedStudents = [...students].sort((a, b) => {
    const aIsOverdue = isOverdue(a.lastPaymentDate);
    const bIsOverdue = isOverdue(b.lastPaymentDate);

    if (aIsOverdue && !bIsOverdue) return -1; // a comes first
    if (!aIsOverdue && bIsOverdue) return 1;  // b comes first
    
    // If both have same status, sort by name
    return a.name.localeCompare(b.name);
  });
  
  const overdueCount = students.filter(s => isOverdue(s.lastPaymentDate)).length;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-shadow hover:shadow-xl">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 bg-gradient-to-r from-pink-500 to-violet-500 flex justify-between items-center text-left hover:opacity-95 transition-opacity"
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
      </button>
      <div
        id={`batch-content-${batchName}`}
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-[3000px]' : 'max-h-0'
        }`}
      >
        <div className="divide-y divide-gray-200 border-t border-violet-200">
          {sortedStudents.length > 0 ? (
            sortedStudents.map(student => (
              <StudentRow 
                key={student.rowIndex} 
                student={student} 
                onUpdatePayment={onUpdatePayment} 
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
