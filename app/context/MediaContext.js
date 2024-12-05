"use client";

import React, { createContext, useContext, useState } from "react";

const MediaContext = createContext();

export const MediaProvider = ({ children }) => {
  const [screenStream, setScreenStream] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);

  return (
    <MediaContext.Provider value={{ screenStream, setScreenStream, cameraStream, setCameraStream }}>
      {children}
    </MediaContext.Provider>
  );
};

export const useMedia = () => useContext(MediaContext);
