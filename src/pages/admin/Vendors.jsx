import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, Download, Store, FileText } from 'lucide-react';

const AdminVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showVendorModal, setShowVendorModal] = useState(false);

  useEffect(() => {
    // Mock data - replace with real API calls
    setVendors([
      {
        id: 1,
        businessName: 'Tech Store Rwanda',
        ownerName: 'Jane Smith',
        email: 'jane@techstore.rw',
        phone: '+250788654321',
        businessAddress: 'KG 123 St, Kigali',
        status: 'active',
        submissionDate: '2024-01-10',
        approvalDate: '2024-01-12',
        documents: {
          businessLicense: 'business_license.pdf',
          idDocument: 'id_document.pdf'
        },
        products: 45,
        orders: 128,
        revenue: 2450000,
        rating: 4.8
      },
      {
        id: 2,
        businessName: 'Fashion Forward RW',
        ownerName: 'Alice Brown',
        email: 'alice@fashion.rw',
        phone: '+250788456789',
        businessAddress: 'KG 456 St, Kigali',
        status: 'pending',
        submissionDate: '2024-01-18',
        approvalDate: null,
        documents: {
          businessLicense: 'business_license_2.pdf',
          idDocument: 'id_document_2.pdf'
        },
        products: 0,
        orders: 0,
        revenue: 0,
        rating: 0
      },
      {
        id: 3,
        businessName: 'Home & Garden Plus',
        ownerName: 'Robert Johnson',
        email: 'robert@homeandgarden.rw',
        phone: '+250788789123',
        businessAddress: 'KG 789 St, Kigali',
        status: 'suspended',
        submissionDate: '2024-01-05',
        approvalDate: '2024-01-07',
        suspensionDate: '2024-01-15',
        suspensionReason: 'Multiple customer complaints',
        documents: {
          businessLicense: 'business_license_3.pdf',
          idDocument: 'id_document_3.pdf'
        },
        products: 23,
        orders: 45,
        revenue: 875000,
        rating: 3.2
      },
      {
        id: 4,
        businessName: 'Electronics Hub',
        ownerName: 'Maria Garcia',
        email: 'maria@electronicshub.rw',
        phone: '+250788321654',
        businessAddress: 'KG 321 St, Kigali',
        status: 'rejected',
        submissionDate: '2024-01-16',
        rejectionDate: '2024-01-17',
        rejectionReason: 'Incomplete documentation',
        documents: {
          businessLicense: 'business_license_4.pdf',
          idDocument: null
        },
        products: 0,
        orders: 0,
        revenue: 0,
        rating: 0
      }
    ]);
  }, []);

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || vendor.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleVendorAction = (vendorId, action, reason = '') => {
    setVendors(vendors.map(vendor => {
      if (vendor.id === vendorId) {
        const today = new Date().toISOString().split('T')[0];
        switch (action) {
          case 'approve':
            return { ...vendor, status: 'active', approvalDate: today };
          case 'reject':
            return { ...vendor, status: 'rejected', rejectionDate: today, rejectionReason: reason };
          case 'suspend':
            return { ...vendor, status: 'suspended', suspensionDate: today, suspensionReason: reason };
          case 'reactivate':
            return { ...vendor, status: 'active', suspensionDate: null, suspensionReason: null };
          default:
            return vendor;
        }
      }
      return vendor;
    }));
  };

  const VendorModal = ({ vendor, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Vendor Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Business Information */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Business Information</h4>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">Business Name</label>
                <p className="font-medium text-lg">{vendor.businessName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Owner Name</label>
                <p className="font-medium">{vendor.ownerName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Email</label>
                <p className="font-medium">{vendor.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Phone</label>
                <p className="font-medium">{vendor.phone}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Business Address</label>
                <p className="font-medium">{vendor.businessAddress}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Status</label>
                <span className={`inline-block px-3 py-1 text-sm rounded-full ${
                  vendor.status === 'active' ? 'bg-green-100 text-green-800' :
                  vendor.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  vendor.status === 'suspended' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {vendor.status}
                </span>
              </div>
            </div>
          </div>

          {/* Activity & Performance */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Performance Metrics</h4>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600">Products</p>
                <p className="text-2xl font-bold text-blue-900">{vendor.products}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600">Orders</p>
                <p className="text-2xl font-bold text-green-900">{vendor.orders}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-600">Revenue</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {vendor.revenue > 0 ? `${(vendor.revenue / 1000000).toFixed(1)}M` : '0'}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-600">Rating</p>
                <p className="text-2xl font-bold text-purple-900">
                  {vendor.rating > 0 ? vendor.rating.toFixed(1) : 'N/A'}
                </p>
              </div>
            </div>

            <h4 className="font-semibold text-gray-900 mb-4">Timeline</h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Submission Date</label>
                <p className="font-medium">{vendor.submissionDate}</p>
              </div>
              {vendor.approvalDate && (
                <div>
                  <label className="text-sm text-gray-600">Approval Date</label>
                  <p className="font-medium">{vendor.approvalDate}</p>
                </div>
              )}
              {vendor.suspensionDate && (
                <div>
                  <label className="text-sm text-gray-600">Suspension Date</label>
                  <p className="font-medium">{vendor.suspensionDate}</p>
                  {vendor.suspensionReason && (
                    <p className="text-sm text-red-600 mt-1">Reason: {vendor.suspensionReason}</p>
                  )}
                </div>
              )}
              {vendor.rejectionDate && (
                <div>
                  <label className="text-sm text-gray-600">Rejection Date</label>
                  <p className="font-medium">{vendor.rejectionDate}</p>
                  {vendor.rejectionReason && (
                    <p className="text-sm text-red-600 mt-1">Reason: {vendor.rejectionReason}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="mt-8">
          <h4 className="font-semibold text-gray-900 mb-4">Documents</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <FileText className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="font-medium">Business License</p>
                  {vendor.documents.businessLicense ? (
                    <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1">
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  ) : (
                    <p className="text-sm text-red-600">Not provided</p>
                  )}
                </div>
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <FileText className="w-8 h-8 text-green-500" />
                <div>
                  <p className="font-medium">ID Document</p>
                  {vendor.documents.idDocument ? (
                    <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1">
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  ) : (
                    <p className="text-sm text-red-600">Not provided</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 mt-8 pt-6 border-t">
          {vendor.status === 'pending' && (
            <>
              <button
                onClick={() => {
                  handleVendorAction(vendor.id, 'approve');
                  onClose();
                }}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Approve</span>
              </button>
              <button
                onClick={() => {
                  const reason = prompt('Reason for rejection:');
                  if (reason) {
                    handleVendorAction(vendor.id, 'reject', reason);
                    onClose();
                  }
                }}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 flex items-center justify-center space-x-2"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject</span>
              </button>
            </>
          )}
          {vendor.status === 'active' && (
            <button
              onClick={() => {
                const reason = prompt('Reason for suspension:');
                if (reason) {
                  handleVendorAction(vendor.id, 'suspend', reason);
                  onClose();
                }
              }}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
            >
              Suspend
            </button>
          )}
          {vendor.status === 'suspended' && (
            <button
              onClick={() => {
                handleVendorAction(vendor.id, 'reactivate');
                onClose();
              }}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
            >
              Reactivate
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Vendor Management</h1>
          <p className="text-gray-600">Manage vendor applications and accounts</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Active Vendors</p>
                <p className="text-2xl font-bold text-gray-900">
                  {vendors.filter(v => v.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {vendors.filter(v => v.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Suspended</p>
                <p className="text-2xl font-bold text-gray-900">
                  {vendors.filter(v => v.status === 'suspended').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Store className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{vendors.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search vendors..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="text-sm text-gray-600">
              {filteredVendors.length} vendors found
            </div>
          </div>
        </div>

        {/* Vendors Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submission
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{vendor.businessName}</div>
                        <div className="text-sm text-gray-500">{vendor.businessAddress}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{vendor.ownerName}</div>
                        <div className="text-sm text-gray-500">{vendor.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        vendor.status === 'active' ? 'bg-green-100 text-green-800' :
                        vendor.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        vendor.status === 'suspended' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {vendor.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {vendor.submissionDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vendor.products} products, {vendor.orders} orders
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedVendor(vendor);
                          setShowVendorModal(true);
                        }}
                        className="text-orange-600 hover:text-orange-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vendor Modal */}
        {showVendorModal && selectedVendor && (
          <VendorModal
            vendor={selectedVendor}
            onClose={() => {
              setShowVendorModal(false);
              setSelectedVendor(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AdminVendors;
