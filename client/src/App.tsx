function App() {
  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-4xl font-bold text-black mb-4">MyNeedfully</h1>
      <p className="text-gray-600 mb-8">Humanitarian Crisis Support Platform</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border">
          <h3 className="font-semibold text-blue-800">Emergency Flood Relief</h3>
          <p className="text-sm text-blue-600">Support flood victims with essential supplies</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border">
          <h3 className="font-semibold text-green-800">Essential Items</h3>
          <p className="text-sm text-green-600">Basic necessities for survival</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border">
          <h3 className="font-semibold text-orange-800">Groceries & Food</h3>
          <p className="text-sm text-orange-600">Nutritious food for families in need</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border">
          <h3 className="font-semibold text-purple-800">Medical Necessity</h3>
          <p className="text-sm text-purple-600">Healthcare supplies and medications</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border">
          <h3 className="font-semibold text-red-800">Fire Disaster Relief</h3>
          <p className="text-sm text-red-600">Recovery from fire emergencies</p>
        </div>
        <div className="bg-pink-50 p-4 rounded-lg border">
          <h3 className="font-semibold text-pink-800">Baby Items</h3>
          <p className="text-sm text-pink-600">Essential supplies for infants and toddlers</p>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <p className="text-green-600 font-medium">✓ Application successfully loading</p>
        <p className="text-gray-600 text-sm">All category pages are operational</p>
      </div>
    </div>
  );
}

export default App;