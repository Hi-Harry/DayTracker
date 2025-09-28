import React, { useState, useEffect } from "react";
import { Badge } from "./ui/badge";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { apiGet } from "../lib/api";

export function StatusIndicator() {
  const [status, setStatus] = useState<"checking" | "online" | "offline">(
    "checking"
  );

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await apiGet(`/health`);
        if (response.ok) {
          setStatus("online");
        } else {
          setStatus("offline");
        }
      } catch (error) {
        setStatus("offline");
      }
    };

    checkServerStatus();
    const interval = setInterval(checkServerStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (status === "checking") {
    return (
      <Badge variant="secondary" className="flex items-center space-x-1">
        <Clock className="w-3 h-3" />
        <span>Checking...</span>
      </Badge>
    );
  }

  if (status === "online") {
    return (
      <Badge
        variant="secondary"
        className="flex items-center space-x-1 bg-green-100 text-green-800"
      >
        <CheckCircle className="w-3 h-3" />
        <span>Online</span>
      </Badge>
    );
  }

  return (
    <Badge
      variant="secondary"
      className="flex items-center space-x-1 bg-yellow-100 text-yellow-800"
    >
      <XCircle className="w-3 h-3" />
      <span>Offline Mode</span>
    </Badge>
  );
}
