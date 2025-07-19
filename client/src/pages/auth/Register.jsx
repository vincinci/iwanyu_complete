import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { User, Store, Eye, EyeOff, Upload, X, FileText, Settings } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    accountType: 'CUSTOMER',
    terms: false,
    // Vendor-specific fields
    businessName: '',
    businessAddress: '',
    idDocument: null
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, idDocument: 'Please upload a valid ID document (JPG, PNG, or PDF)' }));
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, idDocument: 'File size must be less than 5MB' }));
        return;
      }
      
      setFormData(prev => ({ ...prev, idDocument: file }));
      
      // Clear error when valid file is selected
      if (errors.idDocument) {
        setErrors(prev => ({ ...prev, idDocument: '' }));
      }
    }
  };

  const removeFile = () => {
    setFormData(prev => ({ ...prev, idDocument: null }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.accountType) newErrors.accountType = 'Please select an account type';
    
    // Vendor-specific validation
    if (formData.accountType === 'VENDOR') {
      if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required';
      if (!formData.businessAddress.trim()) newErrors.businessAddress = 'Business address is required';
      if (!formData.idDocument) newErrors.idDocument = 'ID document is required for vendor registration';
    }
    
    if (!formData.terms) newErrors.terms = 'You must agree to the terms and conditions';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('firstName', formData.firstName);
      submitData.append('lastName', formData.lastName);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('password', formData.password);
      submitData.append('role', formData.accountType);
      
      // Add vendor-specific data
      if (formData.accountType === 'VENDOR') {
        submitData.append('businessName', formData.businessName);
        submitData.append('businessAddress', formData.businessAddress);
        if (formData.idDocument) {
          submitData.append('idDocument', formData.idDocument);
        }
      }

      console.log('Attempting registration with data:', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        role: formData.accountType,
        businessName: formData.businessName || 'N/A',
        businessAddress: formData.businessAddress || 'N/A',
        hasIdDocument: !!formData.idDocument
      });
      
      const result = await register(submitData);
      
      if (result.success) {
        console.log('Registration successful');
        
        // Redirect based on account type
        if (formData.accountType === 'VENDOR') {
          navigate('/vendor');
        } else if (formData.accountType === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        console.error('Registration failed:', result.error);
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8"
      >
        <div>
          <div className="mx-auto h-12 w-12 bg-orange-500 text-white rounded-xl flex items-center justify-center">
            <span className="text-xl font-bold">I</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-orange-500 hover:text-orange-600">
              sign in to existing account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Account Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Account Type
            </label>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative cursor-pointer rounded-lg border p-4 transition-all ${
                  formData.accountType === 'CUSTOMER'
                    ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-500'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, accountType: 'CUSTOMER' }))}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="accountType"
                    value="CUSTOMER"
                    checked={formData.accountType === 'CUSTOMER'}
                    onChange={handleChange}
                    className="h-4 w-4 text-orange-500 border-gray-300 focus:ring-orange-500"
                  />
                  <div className="ml-3 flex items-center">
                    <User className="h-5 w-5 text-orange-500 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Customer</div>
                      <div className="text-xs text-gray-500">Shop and buy products</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative cursor-pointer rounded-lg border p-4 transition-all ${
                  formData.accountType === 'VENDOR'
                    ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-500'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, accountType: 'VENDOR' }))}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="accountType"
                    value="VENDOR"
                    checked={formData.accountType === 'VENDOR'}
                    onChange={handleChange}
                    className="h-4 w-4 text-orange-500 border-gray-300 focus:ring-orange-500"
                  />
                  <div className="ml-3 flex items-center">
                    <Store className="h-5 w-5 text-orange-500 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Vendor</div>
                      <div className="text-xs text-gray-500">Sell your products</div>
                      <div className="text-xs text-orange-600 font-medium mt-1">⚠ Requires approval</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative cursor-pointer rounded-lg border p-4 transition-all ${
                  formData.accountType === 'ADMIN'
                    ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-500'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, accountType: 'ADMIN' }))}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="accountType"
                    value="ADMIN"
                    checked={formData.accountType === 'ADMIN'}
                    onChange={handleChange}
                    className="h-4 w-4 text-orange-500 border-gray-300 focus:ring-orange-500"
                  />
                  <div className="ml-3 flex items-center">
                    <Settings className="h-5 w-5 text-orange-500 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Admin</div>
                      <div className="text-xs text-gray-500">Platform management</div>
                      <div className="text-xs text-blue-600 font-medium mt-1">🔒 Testing only</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
            {errors.accountType && <p className="mt-1 text-xs text-red-500">{errors.accountType}</p>}
          </div>

          {/* Vendor-specific fields */}
          {formData.accountType === 'VENDOR' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 border-t border-gray-200 pt-6"
            >
              <div className="text-sm font-medium text-gray-700 mb-4">
                <Store className="inline h-4 w-4 mr-2 text-orange-500" />
                Business Information
              </div>

              {/* Business Name */}
              <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name
                </label>
                <input
                  id="businessName"
                  name="businessName"
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors ${
                    errors.businessName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your business name"
                />
                {errors.businessName && <p className="mt-1 text-xs text-red-500">{errors.businessName}</p>}
              </div>

              {/* Business Address */}
              <div>
                <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Address
                </label>
                <textarea
                  id="businessAddress"
                  name="businessAddress"
                  rows={3}
                  required
                  value={formData.businessAddress}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors resize-none ${
                    errors.businessAddress ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your business address"
                />
                {errors.businessAddress && <p className="mt-1 text-xs text-red-500">{errors.businessAddress}</p>}
              </div>

              {/* ID Document Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Document
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Upload a clear photo of your National ID or Passport (JPG, PNG, or PDF, max 5MB)
                </p>
                
                {!formData.idDocument ? (
                  <div className="relative">
                    <input
                      type="file"
                      id="idDocument"
                      name="idDocument"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="idDocument"
                      className={`w-full flex flex-col items-center justify-center px-6 py-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                        errors.idDocument ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    >
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm font-medium text-gray-700">Click to upload ID document</span>
                      <span className="text-xs text-gray-500 mt-1">JPG, PNG, or PDF (max 5MB)</span>
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-orange-500 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">{formData.idDocument.name}</p>
                        <p className="text-xs text-gray-500">
                          {(formData.idDocument.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {errors.idDocument && <p className="mt-1 text-xs text-red-500">{errors.idDocument}</p>}
              </div>
            </motion.div>
          )}

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="First Name"
              />
              {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Last Name"
              />
              {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Email address"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Phone Number"
            />
            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Confirm Password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
          </div>

          {/* Terms */}
          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              checked={formData.terms}
              onChange={handleChange}
              className={`h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded ${
                errors.terms ? 'border-red-500' : ''
              }`}
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
              I agree to the{' '}
              <a href="#" className="text-orange-500 hover:text-orange-600">
                Terms and Conditions
              </a>
            </label>
          </div>
          {errors.terms && <p className="mt-1 text-xs text-red-500">{errors.terms}</p>}

          {/* Submit Button */}
          <div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Register;
