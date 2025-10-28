import { createContext, useContext, useState } from 'react';

const AppContext = createContext(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(null);

  return (
    <AppContext.Provider value={{ userProfile, setUserProfile }}>
      {children}
    </AppContext.Provider>
  );
};
