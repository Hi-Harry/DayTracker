import React, { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Calendar } from "./ui/calendar";
import { Edit, Calendar as CalendarIcon } from "lucide-react";

interface PublicViewerProps {
  data: Record<string, string>;
  isLoggedIn: boolean;
  onEditRequest: () => void;
}

export function PublicViewer({
  data,
  isLoggedIn,
  onEditRequest,
}: PublicViewerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  const getStatusForDate = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const key = `${year}-${month}-${day}`;
    return data[key] || null;
  };

  const getStatusColor = (status: string) => {
    if (!status) return { backgroundColor: "#6b7280" }; // gray-500

    const normalizedStatus = status.toLowerCase().trim();

    switch (normalizedStatus) {
      case "available":
        return { backgroundColor: "#10b981" }; // green-500
      case "busy":
        return { backgroundColor: "#ef4444" }; // red-500
      case "vacation":
        return { backgroundColor: "#3b82f6" }; // blue-500
      case "meeting":
        return { backgroundColor: "#8b5cf6" }; // purple-500
      case "out of office":
      case "outofoffice":
      case "out-of-office":
        return { backgroundColor: "#f97316" }; // orange-500
      case "travel":
        return { backgroundColor: "#eab308" }; // yellow-500
      default:
        // Fallback for any unexpected status
        return { backgroundColor: "#6b7280" }; // gray-500
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const selectedStatus = selectedDate ? getStatusForDate(selectedDate) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <CalendarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            <h1 className="text-xl sm:text-3xl text-gray-900">
              Daily Status Viewer
            </h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            Select a date to view the status for that day
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          {/* Calendar Section */}
          <Card>
            <CardHeader>
              <CardTitle>Select Date</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          {/* Status Display Section */}
          <Card>
            <CardHeader>
              <CardTitle>Status Information</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg text-gray-900 mb-2">
                      Selected Date
                    </h3>
                    <p className="text-gray-700">{formatDate(selectedDate)}</p>
                  </div>

                  <div>
                    <h3 className="text-lg text-gray-900 mb-2">Status</h3>
                    {selectedStatus ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={getStatusColor(selectedStatus)}
                          ></div>
                          <span className="text-gray-700">
                            {selectedStatus}
                          </span>
                        </div>
                        {isLoggedIn && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={onEditRequest}
                            className="flex items-center space-x-1"
                          >
                            <Edit className="w-4 h-4" />
                            <span>Edit</span>
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        <span className="text-gray-500">
                          No status found for this date
                        </span>
                      </div>
                    )}
                  </div>

                  {!isLoggedIn && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <p className="text-blue-800 text-sm">
                        💡 Sign in to edit and manage status information
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Select a date from the calendar to view its status
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Status Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Status Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(data)
                .filter(([_, status]) => status)
                .slice(-6)
                .map(([key, status]) => {
                  const [year, month, day] = key.split("-").map(Number);
                  const date = new Date(year, month, day);
                  return (
                    <div key={key} className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">
                        {date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={getStatusColor(status)}
                        ></div>
                        <span className="text-sm text-gray-800">{status}</span>
                      </div>
                    </div>
                  );
                })}
              {Object.keys(data).filter((key) => data[key]).length === 0 && (
                <div className="col-span-3 text-center py-4 text-gray-500">
                  No status updates available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
