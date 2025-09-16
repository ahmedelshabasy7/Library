import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Auth from "./components/Auth.jsx";
import Books from "./components/Books.jsx";
import PublishBook from "./components/PublishBook.jsx";
import MyBooks from "./components/MyBooks.jsx";
import BorrowingHistory from "./components/BorrowingHistory.jsx";
import Profile from "./components/Profile.jsx";
import AdminPanel from "./components/AdminPanel.jsx";
import Dashboard from "./components/Dashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

export default function App() {
  return (
    <div className="app-container">
      <Navbar />
      <div className="page-body">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/books" element={<Books />} />
          <Route
            path="/publish"
            element={
              <ProtectedRoute role="user">
                <PublishBook />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-books"
            element={
              <ProtectedRoute role="user">
                <MyBooks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/borrowed"
            element={
              <ProtectedRoute role="user">
                <BorrowingHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}
