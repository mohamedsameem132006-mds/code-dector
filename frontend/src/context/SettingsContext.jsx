import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('codesense_theme') || 'dark');
  const [explanationLanguage, setExplanationLanguage] = useState(
    localStorage.getItem('codesense_expl_lang') || 'en'
  ); // 'en' or 'ta'

  useEffect(() => {
    localStorage.setItem('codesense_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('codesense_expl_lang', explanationLanguage);
  }, [explanationLanguage]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <SettingsContext.Provider value={{
      theme,
      setTheme,
      toggleTheme,
      explanationLanguage,
      setExplanationLanguage
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
