import React from "react";
import { AirplaneSpinnerIcon } from "@/constants/icons";

const LoadingSpinner = ({
  message = "Searching for flights...",
  fullScreen = true,
  className = "",
}) => {
  const content = (
    <div className="flex flex-col items-center">
      <AirplaneSpinnerIcon />
      {message && <p className="text-gray-600">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {content}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {content}
    </div>
  );
};

export default LoadingSpinner;
