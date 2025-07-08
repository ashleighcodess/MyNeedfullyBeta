import { useEffect } from "react";

// Simple test component to isolate the issue
function TestApp() {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-coral mb-6">MyNeedfully</h1>
        <p className="text-lg text-gray-700 mb-8">Humanitarian Crisis Support Platform - Testing Mode</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">Emergency Flood Relief</h3>
            <p className="text-sm text-blue-600">Support flood victims with essential supplies</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800 mb-2">Essential Items</h3>
            <p className="text-sm text-green-600">Basic necessities for survival</p>
          </div>
          <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
            <h3 className="font-semibold text-orange-800 mb-2">Groceries & Food</h3>
            <p className="text-sm text-orange-600">Nutritious food for families in need</p>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h3 className="font-semibold text-purple-800 mb-2">Medical Necessity</h3>
            <p className="text-sm text-purple-600">Healthcare supplies and medications</p>
          </div>
          <div className="bg-red-50 p-6 rounded-lg border border-red-200">
            <h3 className="font-semibold text-red-800 mb-2">Fire Disaster Relief</h3>
            <p className="text-sm text-red-600">Recovery from fire emergencies</p>
          </div>
          <div className="bg-pink-50 p-6 rounded-lg border border-pink-200">
            <h3 className="font-semibold text-pink-800 mb-2">Baby Items</h3>
            <p className="text-sm text-pink-600">Essential supplies for infants and toddlers</p>
          </div>
        </div>
        
        <div className="mt-8 p-6 bg-gray-50 rounded-lg border">
          <h4 className="font-semibold text-gray-800 mb-2">Platform Status</h4>
          <div className="space-y-2">
            <p className="text-green-600 font-medium">✓ React application loading successfully</p>
            <p className="text-green-600 font-medium">✓ CSS styling working properly</p>
            <p className="text-green-600 font-medium">✓ Component rendering functional</p>
            <p className="text-blue-600">→ Testing simplified version to isolate DOMException</p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-coral-50 rounded-lg border border-coral-200">
          <p className="text-coral-700">This is a simplified test version to identify what's causing the DOMException. If you can see this page clearly, React is working and we can incrementally add back features.</p>
        </div>
      </div>
    </div>
  );
}

function App() {
  // Comprehensive error handling
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('CAUGHT Unhandled promise rejection:', event.reason);
      console.error('Stack:', event.reason?.stack);
      event.preventDefault();
    };

    const handleError = (event: ErrorEvent) => {
      console.error('CAUGHT Global error:', event.error);
      console.error('Message:', event.message);
      console.error('Filename:', event.filename);
      console.error('Line:', event.lineno);
      event.preventDefault();
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return <TestApp />;
}

export default App;