import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, Download, Store, FileText, AlertTriangle } from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0
  });

  const fetchVendors = async (page = 1, status = '') => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (status && status !== 'all') {
        params.status = status.toUpperCase();
      }
      
      const response = await adminAPI.getVendors(params);
      
      // Transform API data to match frontend expectations
      const transformedVendors = response.data.vendors.map(vendor => ({
        id: vendor.id,
        businessName: vendor.businessName,
        ownerName: `${vendor.user.firstName} ${vendor.user.lastName}`,
        email: vendor.user.email,
        phone: vendor.businessPhone,
        businessAddress: vendor.businessAddress,
        status: vendor.status.toLowerCase(),
        submissionDate: new Date(vendor.createdAt).toISOString().split('T')[0],
        approvalDate: vendor.updatedAt !== vendor.createdAt ? new Date(vendor.updatedAt).toISOString().split('T')[0] : null,
        documents: {
          businessLicense: vendor.licenseDocument,
          idDocument: vendor.kycDocument,
          taxDocument: vendor.taxDocument
        },
        products: 0, // Will be updated with actual count
        orders: 0,   // Will be updated with actual count
        revenue: 0,  // Will be updated with actual revenue
        rating: 0,   // Will be updated with actual rating
        description: vendor.description,
        taxId: vendor.taxId
      }));
      
      setVendors(transformedVendors);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        totalCount: response.data.totalCount
      });
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error('Failed to load vendors');
      // Fallback to empty array
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors(1, filterStatus);
  }, [filterStatus]);

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || vendor.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleVendorAction = async (vendorId, action, reason = '') => {
    try {
      let response;
      
      switch (action) {
        case 'approve':
          response = await adminAPI.updateVendor(vendorId, { 
            status: 'APPROVED' 
          });
          toast.success('Vendor approved successfully');
          break;
          
        case 'reject':
          if (!reason) {
            reason = prompt('Please provide a reason for rejection:');
            if (!reason) return;
          }
          response = await adminAPI.updateVendor(vendorId, { 
            status: 'REJECTED',
            rejectionReason: reason 
          });
          toast.success('Vendor rejected');
          break;
          
        case 'suspend':
          if (!reason) {
            reason = prompt('Please provide a reason for suspension:');
            if (!reason) return;
          }
          response = await adminAPI.updateVendor(vendorId, { 
            status: 'SUSPENDED',
            suspensionReason: reason 
          });
          toast.success('Vendor suspended');
          break;
          
        case 'reactivate':
          response = await adminAPI.updateVendor(vendorId, { 
            status: 'APPROVED' 
          });
          toast.success('Vendor reactivated');
          break;
          
        default:
          return;
      }
      
      // Refresh the vendors list
      await fetchVendors(pagination.currentPage, filterStatus);
      
    } catch (error) {
      console.error('Error updating vendor status:', error);
      toast.error('Failed to update vendor status');
    }
  };

  const VendorModal = ({ vendor, onClose, onVendorAction }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Vendor Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
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
              {vendor.description && (
                <div>
                  <label className="text-sm text-gray-600">Description</label>
                  <p className="font-medium">{vendor.description}</p>
                </div>
              )}
              {vendor.taxId && (
                <div>
                  <label className="text-sm text-gray-600">Tax ID</label>
                  <p className="font-medium">{vendor.taxId}</p>
                </div>
              )}
              <div>
                <label className="text-sm text-gray-600">Status</label>
                <span className={`inline-block px-3 py-1 text-sm rounded-full ${
                  vendor.status === 'approved' || vendor.status === 'active' ? 'bg-green-100 text-green-800' :
                  vendor.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  vendor.status === 'suspended' ? 'bg-red-100 text-red-800' :
                  vendor.status === 'rejected' ? 'bg-gray-100 text-gray-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {vendor.status}
                </span>
              </div>
            </div>
          </div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <FileText className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="font-medium">Business License</p>
                  {vendor.documents.businessLicense ? (
                    <button 
                      onClick={() => {
                        // Handle document download/view
                        window.open(`/api/vendors/documents/${vendor.documents.businessLicense}`, '_blank');
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                    >
                      <Download className="w-4 h-4" />
                      <span>View/Download</span>
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
                    <button 
                      onClick={() => {
                        // Handle document download/view
                        window.open(`/api/vendors/documents/${vendor.documents.idDocument}`, '_blank');
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                    >
                      <Download className="w-4 h-4" />
                      <span>View/Download</span>
                    </button>
                  ) : (
                    <p className="text-sm text-red-600">Not provided</p>
                  )}
                </div>
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <FileText className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="font-medium">Tax Document</p>
                  {vendor.documents.taxDocument ? (
                    <button 
                      onClick={() => {
                        // Handle document download/view
                        window.open(`/api/vendors/documents/${vendor.documents.taxDocument}`, '_blank');
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                    >
                      <Download className="w-4 h-4" />
                      <span>View/Download</span>
                    </button>
                  ) : (
                    <p className="text-sm text-orange-600">Optional</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          {(!vendor.documents.idDocument || !vendor.documents.businessLicense) && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <p className="text-sm text-red-700 font-medium">
                  Missing required documents. ID Document and Business License are required for approval.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-3 mt-8 pt-6 border-t">
          {vendor.status === 'pending' && (
            <>
              <button
                onClick={async () => {
                  await onVendorAction(vendor.id, 'approve');
                  onClose();
                }}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Approve</span>
              </button>
              <button
                onClick={async () => {
                  const reason = prompt('Reason for rejection:');
                  if (reason) {
                    await onVendorAction(vendor.id, 'reject', reason);
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
          {(vendor.status === 'approved' || vendor.status === 'active') && (
            <button
              onClick={async () => {
                const reason = prompt('Reason for suspension:');
                if (reason) {
                  await onVendorAction(vendor.id, 'suspend', reason);
                  onClose();
                }
              }}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 flex items-center justify-center space-x-2"
            >
              <XCircle className="w-4 h-4" />
              <span>Suspend</span>
            </button>
          )}
          {vendor.status === 'suspended' && (
            <button
              onClick={async () => {
                await onVendorAction(vendor.id, 'reactivate');
                onClose();
              }}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Reactivate</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
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
                    Documents
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  // Loading skeleton
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="animate-pulse">
                          <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="animate-pulse flex justify-end space-x-2">
                          <div className="h-8 bg-gray-200 rounded w-8"></div>
                          <div className="h-8 bg-gray-200 rounded w-16"></div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : filteredVendors.length === 0 ? (
                  // No data state
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Store className="w-12 h-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors found</h3>
                        <p className="text-gray-500">
                          {searchTerm || filterStatus !== 'all'
                            ? 'Try adjusting your search or filter criteria.'
                            : 'No vendor applications have been submitted yet.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredVendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{vendor.businessName}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{vendor.businessAddress}</div>
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
                          vendor.status === 'approved' || vendor.status === 'active' ? 'bg-green-100 text-green-800' :
                          vendor.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          vendor.status === 'suspended' ? 'bg-red-100 text-red-800' :
                          vendor.status === 'rejected' ? 'bg-gray-100 text-gray-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {vendor.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {vendor.submissionDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {vendor.documents.idDocument && (
                            <div className="w-2 h-2 bg-green-500 rounded-full" title="ID Document"></div>
                          )}
                          {vendor.documents.businessLicense && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" title="Business License"></div>
                          )}
                          {vendor.documents.taxDocument && (
                            <div className="w-2 h-2 bg-purple-500 rounded-full" title="Tax Document"></div>
                          )}
                          {!vendor.documents.idDocument && !vendor.documents.businessLicense && !vendor.documents.taxDocument && (
                            <AlertTriangle className="w-4 h-4 text-red-500" title="Missing documents" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setSelectedVendor(vendor);
                              setShowVendorModal(true);
                            }}
                            className="text-orange-600 hover:text-orange-900"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {vendor.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleVendorAction(vendor.id, 'approve')}
                                className="text-green-600 hover:text-green-900"
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleVendorAction(vendor.id, 'reject')}
                                className="text-red-600 hover:text-red-900"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {vendor.status === 'approved' && (
                            <button
                              onClick={() => handleVendorAction(vendor.id, 'suspend')}
                              className="text-red-600 hover:text-red-900"
                              title="Suspend"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                          {vendor.status === 'suspended' && (
                            <button
                              onClick={() => handleVendorAction(vendor.id, 'reactivate')}
                              className="text-green-600 hover:text-green-900"
                              title="Reactivate"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((pagination.currentPage - 1) * 10) + 1} to {Math.min(pagination.currentPage * 10, pagination.totalCount)} of {pagination.totalCount} vendors
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => fetchVendors(pagination.currentPage - 1, filterStatus)}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-2 text-sm font-medium text-gray-700">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => fetchVendors(pagination.currentPage + 1, filterStatus)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Vendor Modal */}
        {showVendorModal && selectedVendor && (
          <VendorModal
            vendor={selectedVendor}
            onClose={() => {
              setShowVendorModal(false);
              setSelectedVendor(null);
            }}
            onVendorAction={handleVendorAction}
          />
        )}
      </div>
    </div>
  );
};

export default AdminVendors;
