import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const ApiContext = createContext();

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};

export const ApiProvider = ({ children }) => {
  const [isApiConnected, setIsApiConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkApiConnection();
  }, []);

  const checkApiConnection = async () => {
    try {
      setIsChecking(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/health`,
        { 
          method: 'GET',
          timeout: 5000 
        }
      );
      
      if (response.ok) {
        setIsApiConnected(true);
        console.log('✅ Backend connected successfully');
      } else {
        throw new Error('API responded with error');
      }
    } catch (error) {
      console.error('❌ Backend connection failed:', error.message);
      setIsApiConnected(false);
      
      // Show error in production - critical for real users
      if (import.meta.env.PROD) {
        toast.error('Unable to connect to server. Please try again later.', {
          duration: 5000,
          id: 'api-connection-error'
        });
      }
    } finally {
      setIsChecking(false);
    }
  };

  const value = {
    isApiConnected,
    isChecking,
    checkApiConnection
  };

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
};

export default ApiProvider;
