import React from "react";
import { Button } from "./ui/button";
import { LogOut, LogIn, Calendar } from "lucide-react";

interface NavigationProps {
  currentPage: "dashboard" | "public";
  onPageChange: (page: "dashboard" | "public") => void;
  onLogout: () => void;
  isLoggedIn: boolean;
}

export function Navigation({
  currentPage,
  onPageChange,
  onLogout,
  isLoggedIn,
}: NavigationProps) {
  return (
    <nav className="bg-white border-b border-gray-200 px-2 md:px-4 py-2 md:py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo and Navigation buttons - Left aligned */}
        <div className="flex items-center space-x-3 md:space-x-4">
          {/* Logo */}
          <div className="flex items-center space-x-2 md:space-x-2">
            <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-600 rounded-sm flex items-center justify-center">
              <Calendar className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
            <span className="text-base md:text-md text-gray-900 font-medium">
              DayTracker
            </span>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center space-x-2 md:space-x-2">
            <Button
              variant={currentPage === "public" ? "default" : "ghost"}
              onClick={() => onPageChange("public")}
              size="sm"
              className="text-sm md:text-sm px-3 md:px-3 py-2 md:py-2"
            >
              Public View
            </Button>
            {isLoggedIn && (
              <Button
                variant={currentPage === "dashboard" ? "default" : "ghost"}
                onClick={() => onPageChange("dashboard")}
                size="sm"
                className="text-sm md:text-sm px-3 md:px-3 py-2 md:py-2"
              >
                Dashboard
              </Button>
            )}
          </div>
        </div>

        {/* Auth button - Right aligned */}
        <div className="flex items-center">
          {isLoggedIn ? (
            <Button
              variant="outline"
              onClick={onLogout}
              className="flex items-center space-x-2 md:space-x-2 text-sm md:text-sm px-3 md:px-3 py-2 md:py-2"
              size="sm"
            >
              <LogOut className="w-4 h-4 md:w-4 md:h-4" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          ) : (
            <Button
              variant="default"
              onClick={() => onPageChange("dashboard")}
              className="flex items-center space-x-2 md:space-x-2 text-sm md:text-sm px-3 md:px-3 py-2 md:py-2"
              size="sm"
            >
              <LogIn className="w-4 h-4 md:w-4 md:h-4" />
              <span className="hidden md:inline">Login</span>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
