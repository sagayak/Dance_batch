import React from 'react';

interface ReportProps {
  totalStudents: number;
  overdueStudents: number;
}

const Report: React.FC<ReportProps> = ({ totalStudents, overdueStudents }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-4">
      <h2 className="text-xl font-bold mb-4">Reports</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-100 border border-blue-400 text-blue-800 rounded-lg p-4 transition-transform transform hover:scale-105">
          <h3 className="text-lg font-semibold">Total Students</h3>
          <p className="text-3xl font-bold">{totalStudents}</p>
        </div>
        <div className="bg-red-100 border border-red-400 text-red-800 rounded-lg p-4 transition-transform transform hover:scale-105">
          <h3 className="text-lg font-semibold">Overdue Students</h3>
          <p className="text-3xl font-bold">{overdueStudents}</p>
        </div>
      </div>
    </div>
  );
};

export default Report;
