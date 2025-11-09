
import React from 'react';
import { Batches, Student } from '../types';

interface HeaderProps {
  batches: Batches | null;
}

const Header: React.FC<HeaderProps> = ({ batches }) => {

  const handleExportCSV = () => {
    if (!batches) return;

    const allStudents: (Student & { batch: string })[] = [];
    Object.keys(batches).forEach(batchName => {
      batches[batchName].forEach(student => {
        allStudents.push({ ...student, batch: batchName });
      });
    });

    if (allStudents.length === 0) {
        alert("No student data to export.");
        return;
    }

    const headers = ['Batch', 'Student Name', 'Last Payment Date', 'Phone Number', 'Parent Name'];
    const csvRows = [
      headers.join(','),
      ...allStudents.map(s => 
        [
          `"${s.batch}"`,
          `"${s.name}"`,
          `"${s.lastPaymentDate}"`,
          `"${s.phone || ''}"`,
          `"${s.parentName || ''}"`
        ].join(',')
      )
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'dance-group-payments.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <header className="bg-white shadow-md rounded-lg mb-8">
      <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">
          Kids Dance Group Manager
        </h1>
        <button
          onClick={handleExportCSV}
          disabled={!batches || Object.keys(batches).length === 0}
          className="bg-violet-500 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-violet-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          <span className="hidden sm:inline">Export to CSV</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
