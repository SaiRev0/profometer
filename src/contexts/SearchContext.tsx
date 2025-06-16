'use client';

import { ReactNode, createContext, useContext, useEffect, useState } from 'react';

interface SearchContextType {
  isSearchOpen: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  openSearch: () => void;
  closeSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      if (isSearchOpen) {
        closeSearch();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isSearchOpen]);

  const openSearch = () => {
    setSearchTerm(''); // Clear search term when opening
    setIsSearchOpen(true);
    // Push a new state to history when opening the modal
    window.history.pushState({ modal: 'search' }, '');
  };

  const closeSearch = () => {
    setSearchTerm(''); // Clear search term when closing
    setIsSearchOpen(false);
    // Only go back if we're closing via the back button or manual close
    // Don't interfere if navigation is happening
    if (window.history.state?.modal === 'search') {
      window.history.replaceState(null, '');
    }
  };

  return (
    <SearchContext.Provider
      value={{
        isSearchOpen,
        searchTerm,
        setSearchTerm,
        openSearch,
        closeSearch
      }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}
