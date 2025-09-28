import React, { useMemo, useState } from "react";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Save } from "lucide-react";
import { apiPost } from "../lib/api";
import { showToast } from "../lib/toast";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// For leap year, February has 29 days
const isLeapYear = (year: number) => {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};

const getDaysInMonth = (
  month: number,
  year: number = new Date().getFullYear()
) => {
  if (month === 1 && isLeapYear(year)) return 29; // February in leap year
  return daysInMonth[month];
};

const statusOptions = [
  "Available",
  "Busy",
  "Out of Office",
  "Meeting",
  "Travel",
  "Vacation",
];
const NO_STATUS = "none";

interface DashboardProps {
  data: Record<string, string>;
  onDataChange: (data: Record<string, string>) => void;
  userId: string;
  accessToken: string;
}

export function Dashboard({
  data,
  onDataChange,
  userId,
  accessToken,
}: DashboardProps) {
  const [currentData, setCurrentData] = useState(data);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Update currentData when data prop changes (after login)
  React.useEffect(() => {
    setCurrentData(data);
  }, [data]);

  // Derived stats for the summary cards
  const { totalTracked, activeCount, completionRate, streakDays } =
    useMemo(() => {
      const entries = Object.entries(currentData);
      const tracked = entries.length;
      const active = entries.filter(([, v]) => v === "Available").length;
      const completion =
        Math.round(((tracked / 365) * 100 + Number.EPSILON) * 10) / 10;

      // Calculate streak days
      const calculateStreak = (data: Record<string, string>) => {
        if (Object.keys(data).length === 0) return 0;

        // Sort entries by date key (year-month-day format)
        const sortedEntries = Object.entries(data).sort(([a], [b]) => {
          const [yearA, monthA, dayA] = a.split("-").map(Number);
          const [yearB, monthB, dayB] = b.split("-").map(Number);
          const dateA = new Date(yearA, monthA, dayA);
          const dateB = new Date(yearB, monthB, dayB);
          return dateA.getTime() - dateB.getTime();
        });

        let currentStreak = 0;
        let maxStreak = 0;
        let lastStatus: string | null = null;

        for (const [, status] of sortedEntries) {
          if (status === lastStatus && status) {
            currentStreak++;
          } else {
            maxStreak = Math.max(maxStreak, currentStreak);
            currentStreak = status ? 1 : 0;
            lastStatus = status;
          }
        }

        return Math.max(maxStreak, currentStreak);
      };

      const streak = calculateStreak(currentData);

      return {
        totalTracked: tracked,
        activeCount: active,
        completionRate: isNaN(completion) ? 0 : completion,
        streakDays: streak,
      };
    }, [currentData]);

  const handleCellChange = (month: number, day: number, value: string) => {
    const key = `${selectedYear}-${month}-${day}`;
    const newData = { ...currentData, [key]: value };
    setCurrentData(newData);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await apiPost(
        `/api/status/${userId}`,
        { statusData: currentData },
        accessToken
      );
      if (!response.ok) {
        showToast.error("Failed to save data. Please try again.");
        return;
      }
      const result = await response.json();
      onDataChange(currentData);
      setHasChanges(false);
      showToast.success("Data saved successfully!");
    } catch (error) {
      showToast.error(
        "Network error while saving. Please check your connection and try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const isValidDay = (month: number, day: number) => {
    return day <= getDaysInMonth(month);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Header + Save */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl text-gray-900">Dashboard</h1>
            <p className="text-sm sm:text-base text-gray-600">
              Your annual status at a glance
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="flex items-center space-x-2 w-auto self-end sm:self-center"
            size="sm"
          >
            <Save className="w-4 h-4" />
            <span className="text-sm">
              {isSaving ? "Saving..." : "Save Changes"}
            </span>
          </Button>
        </div>

        {/* Summary cards - stacked on mobile, single row on desktop */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Card className="w-full sm:flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm text-gray-500">
                Total Days Tracked
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg sm:text-2xl font-semibold">
                {totalTracked}
              </div>
            </CardContent>
          </Card>

          <Card className="w-full sm:flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm text-gray-500">
                Active Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg sm:text-2xl font-semibold">
                {activeCount}
              </div>
            </CardContent>
          </Card>

          <Card className="w-full sm:flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm text-gray-500">
                Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg sm:text-2xl font-semibold">
                {completionRate}%
              </div>
            </CardContent>
          </Card>

          <Card className="w-full sm:flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm text-gray-500">
                Streak Days
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg sm:text-2xl font-semibold">
                {streakDays > 0 ? streakDays : "—"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar + Side panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2">
            <Card className="w-full sm:flex-1">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base sm:text-lg">
                  Annual Status Grid
                </CardTitle>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700">Year:</label>
                  <Select
                    value={selectedYear.toString()}
                    onValueChange={(value) => setSelectedYear(parseInt(value))}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => {
                        const year = new Date().getFullYear() - 5 + i;
                        return (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-2 sm:p-6">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr>
                        <th className="p-1 sm:p-2 border border-gray-300 bg-gray-100 w-12 sm:w-16 text-xs">
                          Day
                        </th>
                        {months.map((month) => (
                          <th
                            key={month}
                            className="p-1 sm:p-2 border border-gray-300 bg-gray-100 min-w-24 sm:min-w-32 text-xs"
                          >
                            {month}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 31 }, (_, day) => (
                        <tr key={day}>
                          <td className="p-1 sm:p-2 border border-gray-300 bg-gray-50 text-center text-xs">
                            {day + 1}
                          </td>
                          {months.map((_, monthIndex) => {
                            const isValid = isValidDay(monthIndex, day + 1);
                            const cellKey = `${selectedYear}-${monthIndex}-${
                              day + 1
                            }`;
                            const cellValue = currentData[cellKey] || "";
                            const selectValue =
                              cellValue === "" ? NO_STATUS : cellValue;
                            return (
                              <td
                                key={`${monthIndex}-${day}`}
                                className={`p-0.5 sm:p-1 border border-gray-300 ${
                                  !isValid ? "bg-gray-100" : "bg-white"
                                }`}
                              >
                                {isValid ? (
                                  <Select
                                    value={selectValue}
                                    onValueChange={(value) =>
                                      handleCellChange(
                                        monthIndex,
                                        day + 1,
                                        value === NO_STATUS ? "" : value
                                      )
                                    }
                                  >
                                    <SelectTrigger className="w-full h-6 sm:h-8 text-xs">
                                      <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value={NO_STATUS}>
                                        No Status
                                      </SelectItem>
                                      {statusOptions.map((status) => (
                                        <SelectItem key={status} value={status}>
                                          {status}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <div className="h-6 sm:h-8 flex items-center justify-center text-gray-400 text-xs">
                                    N/A
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side panel */}
          <div className="space-y-4 sm:space-y-6">
            <Card className="w-full sm:flex-1">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    setCurrentData({
                      ...currentData,
                      ...Object.fromEntries(
                        Array.from({ length: 31 }, (_, d) => [
                          `${selectedYear}-0-${d + 1}`,
                          "Available",
                        ])
                      ),
                    });
                  }}
                >
                  Auto-fill Active (Jan)
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    setCurrentData({});
                    setHasChanges(true);
                  }}
                >
                  Clear All Data
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
