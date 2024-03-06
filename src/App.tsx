import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './Pages/HomePage';
import AccountManagementPage from './Pages/AccountManagementPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/account-management" element={<AccountManagementPage />} />
      </Routes>
    </Router>
  );
}

export default App;
