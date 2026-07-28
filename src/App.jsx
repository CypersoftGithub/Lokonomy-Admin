import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BusinessList from './pages/Business/BusinessList';
import BusinessDetail from './pages/Business/BusinessDetail';
import Users from './pages/Users';
import Partners from './pages/Partners';
import Categories from './pages/Categories';
import Feed from './pages/Feed';
import Market from './pages/Market';
import Jobs from './pages/Jobs';
import Resumes from './pages/Resumes';
import Stories from './pages/Stories';
import Notifications from './pages/Notifications';
import Banners from './pages/Banners';
import Plans from './pages/Plans';
import ProtectedRoute from './components/common/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { fontFamily: 'Inter, sans-serif', borderRadius: '10px', fontSize: '14px' },
          success: { iconTheme: { primary: '#26af61', secondary: 'white' } },
          error: { iconTheme: { primary: '#EF4444', secondary: 'white' } },
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="business" element={<BusinessList />} />
              <Route path="business/:id" element={<BusinessDetail />} />
              <Route path="users" element={<Users />} />
              <Route path="partners" element={<Partners />} />
              <Route path="categories" element={<Categories />} />
              <Route path="feed" element={<Feed />} />
              <Route path="market" element={<Market />} />
              <Route path="jobs" element={<Jobs />} />
              <Route path="resume" element={<Resumes />} />
              <Route path="stories" element={<Stories />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="banners" element={<Banners />} />
              <Route path="plans" element={<Plans />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
