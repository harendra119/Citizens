import React, { createContext, useState } from 'react';

// Create the context
export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [isTrue, setIsTrue] = useState(true); // Default value is true

  // Toggle function to change the value
  const toggleValue = () => {
    setIsTrue((prev) => !prev);
  };

  return (
    <DataContext.Provider value={{ isTrue, toggleValue }}>
      {children}
    </DataContext.Provider>
  );
};