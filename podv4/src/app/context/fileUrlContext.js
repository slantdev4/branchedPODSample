// FileUrlProvider.js

import React, { useState, createContext, useContext } from 'react';

const FileUrlContext = createContext();

export const useFileUrl = () => useContext(FileUrlContext);

export const FileUrlProvider = ({ children }) => {
  const [fileData, setFileData] = useState({
    fileUrl: '',
    slicerApiResponse: null,
    totalPrice: 0,
    filename: '',
    color: 'gray', 
  });
  const [quantity, setQuantity] = useState(1); // Separate quantity state

  const updateQuantity = (newQuantity) => {
    if (!isNaN(newQuantity) && newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };
  const updateColor = (newColor) => {
    setFileData(prevData => ({ ...prevData, color: newColor }));
  };
  return (
    <FileUrlContext.Provider value={{ fileData, setFileData, quantity, updateQuantity, updateColor }}>
      {children}
    </FileUrlContext.Provider>
  );
};
