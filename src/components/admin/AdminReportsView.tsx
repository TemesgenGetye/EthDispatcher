import React from 'react';
import { BarChart3, TrendingUp, DollarSign, Package, Truck, Calendar } from 'lucide-react';

const AdminReportsView: React.FC = () => {
  return (
    <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Analytics & Reports</h2>
        <p className="text-sm text-gray-600 mt-1">
          Track performance metrics and generate insights
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">$45.2K</div>
              <div className="text-sm text-gray-600">Revenue Today</div>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
          <div className="mt-2 flex items-center text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            +12.5% from yesterday
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">156</div>
              <div className="text-sm text-gray-600">Orders Today</div>
            </div>
            <Package className="w-8 h-8 text-blue-600" />
          </div>
          <div className="mt-2 flex items-center text-sm text-blue-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            +8.3% from yesterday
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">24</div>
              <div className="text-sm text-gray-600">Active Drivers</div>
            </div>
            <Truck className="w-8 h-8 text-purple-600" />
          </div>
          <div className="mt-2 flex items-center text-sm text-purple-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            +2 from yesterday
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">94.2%</div>
              <div className="text-sm text-gray-600">On-time Rate</div>
            </div>
            <Calendar className="w-8 h-8 text-orange-600" />
          </div>
          <div className="mt-2 flex items-center text-sm text-orange-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            +1.2% from last week
          </div>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Order Trends</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">Chart visualization coming soon</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Driver Performance</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">Performance metrics coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReportsView;