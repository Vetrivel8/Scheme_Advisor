import { Users, FileText, Layers, BarChart3 } from "lucide-react";

export default function Admin() {
  return (
    <div className="min-h-screen bg-gray-100 px-6 py-8">
      
      {/* Page Title */}
      <h2 className="text-3xl font-bold text-gray-800 mb-8">
        Admin Dashboard
      </h2>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Card 1 */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <h4 className="text-sm text-gray-500">Total Schemes</h4>
            <FileText className="text-blue-600" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-2">124</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <h4 className="text-sm text-gray-500">Registered Users</h4>
            <Users className="text-green-600" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-2">2,540</p>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <h4 className="text-sm text-gray-500">Categories</h4>
            <Layers className="text-purple-600" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-2">6</p>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <h4 className="text-sm text-gray-500">Applications</h4>
            <BarChart3 className="text-red-600" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-2">1,120</p>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="mt-10 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Quick Actions
        </h3>

        <div className="flex flex-wrap gap-4">
          <button className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Add New Scheme
          </button>

          <button className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
            Manage Categories
          </button>

          <button className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
            View Reports
          </button>
        </div>
      </div>

      {/* Placeholder Analytics Section */}
      <div className="mt-10 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Analytics Overview
        </h3>
        <p className="text-gray-500">
          Charts and analytics will be displayed here.
        </p>
      </div>

    </div>
  );
}
