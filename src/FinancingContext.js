import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const FinancingContext = createContext();

export const useFinancingContext = () => useContext(FinancingContext);

const FinancingProvider = ({ children }) => {
  const [countries, setCountries] = useState([]);
  const [opecCountries, setOpecCountries] = useState([]);
  const [currency, setCurrency] = useState('');
  const [requestData, setRequestData] = useState({
    name: '',
    surname: '',
    country: '',
    projectCode: '',
    description: '',
    amount: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    // Fetch country list (using a public API)
    axios.get('https://restcountries.com/v3.1/all')
      .then(response => setCountries(response.data));
    
    // OPEC member countries list (manually defined)
    setOpecCountries(["Saudi Arabia", "Iran", "Iraq", "Kuwait", "United Arab Emirates", "Venezuela", "Nigeria", "Algeria", "Libya", "Angola", "Ecuador", "Gabon", "Equatorial Guinea", "Congo", "Indonesia"]);
  }, []);

  useEffect(() => {
    // If country is an OPEC member, set currency to USD
    if (opecCountries.includes(requestData.country)) {
      setCurrency('USD');
    } else {
      setCurrency(''); // reset for user-defined currency
    }
  }, [requestData.country]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setRequestData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <FinancingContext.Provider value={{ countries, requestData, setRequestData, handleFormChange, currency }}>
      {children}
    </FinancingContext.Provider>
  );
};

export default FinancingProvider;
