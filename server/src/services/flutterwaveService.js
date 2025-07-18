const axios = require('axios');

const FLUTTERWAVE_BASE_URL = 'https://api.flutterwave.com/v3';

const initializeFlutterwave = async (paymentData) => {
  try {
    const response = await axios.post(`${FLUTTERWAVE_BASE_URL}/payments`, paymentData, {
      headers: {
        'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Flutterwave payment initialization error:', error.response?.data || error.message);
    throw error;
  }
};

const verifyPayment = async (transactionId) => {
  try {
    const response = await axios.get(`${FLUTTERWAVE_BASE_URL}/transactions/${transactionId}/verify`, {
      headers: {
        'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Flutterwave payment verification error:', error.response?.data || error.message);
    throw error;
  }
};

const processRefund = async (transactionId, amount) => {
  try {
    const response = await axios.post(`${FLUTTERWAVE_BASE_URL}/transactions/${transactionId}/refund`, {
      amount
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Flutterwave refund error:', error.response?.data || error.message);
    throw error;
  }
};

module.exports = {
  initializeFlutterwave,
  verifyPayment,
  processRefund
};
