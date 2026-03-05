import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeTeamId, setActiveTeamId] = useState(() => localStorage.getItem('activeTeamId'));

  const login = (userData: any) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null); setActiveTeamId(null);
    localStorage.removeItem('user'); localStorage.removeItem('activeTeamId');
  };

  const setActiveTeam = (teamId: string) => {
    setActiveTeamId(teamId);
    localStorage.setItem('activeTeamId', teamId);
  };

  return (
    <AuthContext.Provider value={{ user, activeTeamId, login, logout, setActiveTeam }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
