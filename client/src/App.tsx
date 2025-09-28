import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { Login } from "./components/Login";
import { Signup } from "./components/Signup";
import { Dashboard } from "./components/Dashboard";
import { PublicViewer } from "./components/PublicViewer";
import { Navigation } from "./components/Navigation";
import { apiGet } from "./lib/api";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Toaster } from "sonner";

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [accessToken, setAccessToken] = useState<string>("");
  const [statusData, setStatusData] = useState<Record<string, string>>({});
  const [publicStatusData, setPublicStatusData] = useState<
    Record<string, string>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for persisted session
    const savedUserId = localStorage.getItem("userId");
    const savedToken = localStorage.getItem("accessToken");

    if (savedUserId && savedToken) {
      setUserId(savedUserId);
      setAccessToken(savedToken);
      setIsLoggedIn(true);
      loadUserData(savedUserId, savedToken);
    }

    setIsLoading(false);
    loadPublicData();
  }, []);

  // Refresh public data when navigating to public view
  useEffect(() => {
    if (location.pathname === "/" && !isLoggedIn) {
      loadPublicData();
    }
  }, [location.pathname, isLoggedIn]);

  const loadUserData = async (uid: string, token: string) => {
    try {
      const response = await apiGet(`/api/status/${uid}`, token);
      if (response.ok) {
        const result = await response.json();
        setStatusData(result.data || {});
      } else {
        setStatusData({});
      }
    } catch {
      setStatusData({});
    }
  };

  const loadPublicData = async () => {
    try {
      const response = await apiGet(`/api/status/public/all`);
      if (response.ok) {
        const result = await response.json();
        setPublicStatusData(result.data || {});
      } else {
        setPublicStatusData({});
      }
    } catch {
      setPublicStatusData({});
    }
  };

  const handleLogin = async (uid: string, token: string) => {
    setUserId(uid);
    setAccessToken(token);
    setIsLoggedIn(true);
    localStorage.setItem("userId", uid);
    localStorage.setItem("accessToken", token);
    navigate("/dashboard");
    await loadUserData(uid, token);
  };

  const handleSignup = async (uid: string, token: string) => {
    // After signup, redirect to login instead of auto-login
    setIsLoggedIn(false);
    setUserId("");
    setAccessToken("");
    localStorage.removeItem("userId");
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  const handleLogout = async () => {
    setIsLoggedIn(false);
    setUserId("");
    setAccessToken("");
    setStatusData({});
    localStorage.removeItem("userId");
    localStorage.removeItem("accessToken");
    // Refresh public data after logout
    loadPublicData();
    navigate("/");
  };

  const handlePageChange = (page: "dashboard" | "public") => {
    if (page === "dashboard" && !isLoggedIn) {
      navigate("/login");
    } else {
      if (page === "public") {
        // Refresh public data when navigating to public view
        loadPublicData();
      }
      navigate(page === "dashboard" ? "/dashboard" : "/");
    }
  };

  const handleDataChange = (newData: Record<string, string>) => {
    setStatusData(newData);
  };

  const handleEditRequest = () => {
    if (isLoggedIn) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl">📅</span>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        currentPage={
          location.pathname === "/login" || location.pathname === "/signup"
            ? "public"
            : location.pathname === "/dashboard"
            ? "dashboard"
            : "public"
        }
        onPageChange={handlePageChange}
        onLogout={handleLogout}
        isLoggedIn={isLoggedIn}
      />

      <Routes>
        <Route
          path="/"
          element={
            <PublicViewer
              data={isLoggedIn ? statusData : publicStatusData}
              isLoggedIn={isLoggedIn}
              onEditRequest={handleEditRequest}
            />
          }
        />

        <Route
          path="/login"
          element={
            !isLoggedIn ? (
              <Login
                onLogin={handleLogin}
                onSignupRequest={() => navigate("/signup")}
              />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        <Route
          path="/signup"
          element={
            !isLoggedIn ? (
              <Signup
                onSignup={handleSignup}
                onLoginRequest={() => navigate("/login")}
              />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        <Route
          path="/dashboard"
          element={
            isLoggedIn ? (
              <ErrorBoundary>
                <Dashboard
                  data={statusData}
                  onDataChange={handleDataChange}
                  userId={userId}
                  accessToken={accessToken}
                />
              </ErrorBoundary>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
