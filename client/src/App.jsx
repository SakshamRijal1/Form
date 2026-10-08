import { Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import CreateForm from "./pages/CreateForm";
import FormEditor from "./pages/FormEditor";
import PublicForm from "./pages/PublicForm";
import Responses from "./pages/Responses";

import Login from "./pages/Login";
import Register from "./pages/Register";

import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

function App() {
  return (
    <Routes>

      {/* =========================
          PUBLIC AUTH ROUTES
      ========================== */}

      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>


      {/* =========================
          PUBLIC FORM
      ========================== */}

      <Route
        path="/forms/public/:shareId"
        element={<PublicForm />}
      />


      {/* =========================
          PROTECTED ROUTES
      ========================== */}

      <Route element={<ProtectedRoute />}>

        <Route
          path="/"
          element={<Dashboard />}
        />

        <Route
          path="/create"
          element={<CreateForm />}
        />

        <Route
          path="/forms/:id/edit"
          element={<FormEditor />}
        />

        <Route
          path="/forms/:id/responses"
          element={<Responses />}
        />

      </Route>

    </Routes>
  );
}

export default App;