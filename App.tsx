import React, { useState, useEffect, useCallback } from 'react';
import { Batches } from './types';
import { fetchData, updatePaymentDate, isSetupNeeded } from './services/googleSheetsService';
import Header from './components/Header';
import BatchCard from './components/BatchCard';
import Loader from './components/Loader';
import SetupGuide from './components/SetupGuide';

const App: React.FC = () => {
  const [batches, setBatches] = useState<Batches | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    if (isSetupNeeded()) {
      setShowSetup(true);
      setLoading(false);
      return;
    }
    setShowSetup(false);
    setLoading(true);
    setError(null);
    try {
      const data = await fetchData();
      setBatches(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdatePayment = async (rowIndex: number): Promise<void> => {
    const originalBatches = JSON.parse(JSON.stringify(batches)); // Deep copy for optimistic update
    try {
      // Optimistic UI Update
      setBatches(prevBatches => {
        if (!prevBatches) return null;
        const newBatches = { ...prevBatches };
        let found = false;
        for (const batchKey in newBatches) {
          const studentIndex = newBatches[batchKey].findIndex(s => s.rowIndex === rowIndex);
          if (studentIndex > -1) {
            // Placeholder for new date, actual value comes from response
            newBatches[batchKey][studentIndex].lastPaymentDate = 'Updating...';
            found = true;
            break;
          }
        }
        return newBatches;
      });

      const updatedDate = await updatePaymentDate(rowIndex);

      // Final UI Update with server-confirmed date
      setBatches(prevBatches => {
         if (!prevBatches) return null;
        const newBatches = { ...prevBatches };
         let found = false;
        for (const batchKey in newBatches) {
          const studentIndex = newBatches[batchKey].findIndex(s => s.rowIndex === rowIndex);
          if (studentIndex > -1) {
            newBatches[batchKey][studentIndex].lastPaymentDate = updatedDate;
            found = true;
            break;
          }
        }
        return newBatches;
      });

    } catch (err) {
      console.error(err);
      // Revert on failure
      setBatches(originalBatches);
      throw err; // Re-throw to be caught in the component
    }
  };


  const renderContent = () => {
    if (loading) {
      return <Loader />;
    }
    if (showSetup) {
      return <SetupGuide />;
    }
    if (error) {
      return (
        <div className="text-center p-8 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong.</h2>
          <p>{error}</p>
          <p className="mt-4">Please check your Apps Script URL, network connection, and ensure your Google Sheet is set up correctly.</p>
        </div>
      );
    }
    if (batches && Object.keys(batches).length > 0) {
      return (
        <div className="space-y-4">
          {Object.entries(batches).sort(([a], [b]) => a.localeCompare(b)).map(([batchName, students]) => (
            <BatchCard 
              key={batchName} 
              batchName={batchName} 
              students={students}
              onUpdatePayment={handleUpdatePayment}
            />
          ))}
        </div>
      );
    }
    return (
      <div className="text-center p-8 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">No Data Found</h2>
        <p>Your Google Sheet might be empty or not formatted correctly. Please add some student data to get started.</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-7xl">
        <Header batches={batches} />
        <main>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
