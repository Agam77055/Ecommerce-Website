// src/components/Layout/Header.tsx
import React from 'react';
import TopBar from '@/components/TopBar/TopBar';
import Navbar from '@/components/Navbar/Navbar';

const Header: React.FC = () => (
  <header className="flex flex-col">
    <TopBar />
    <Navbar />
  </header>
);

export default Header;
