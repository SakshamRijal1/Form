import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import React from "react";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateForm from "./pages/CreateForm";
import FormEditor from "./pages/FormEditor";
import PublicForm from "./pages/PublicForm";
import Responses from "./pages/Responses";

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forms/public/:shareId" element={<PublicForm />} />

        <Route path="/" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />

        <Route path="/create" element={
          <ProtectedRoute><CreateForm /></ProtectedRoute>
        } />

        <Route path="/forms/:id/edit" element={
          <ProtectedRoute><FormEditor /></ProtectedRoute>
        } />

        <Route path="/forms/:id/responses" element={
          <ProtectedRoute><Responses /></ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  );
}
