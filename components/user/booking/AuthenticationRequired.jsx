import Link from "next/link";
import { BOOKING_MESSAGES } from "@/constants/bookingConstants";

const AuthenticationRequired = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <h3 className="font-semibold text-red-900 mb-2">
            {BOOKING_MESSAGES.UI.AUTHENTICATION_REQUIRED}
          </h3>
          <p className="text-red-700 mb-4">
            {BOOKING_MESSAGES.UI.PLEASE_LOGIN}
          </p>
          <Link
            href="/"
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            {BOOKING_MESSAGES.UI.GO_TO_HOME}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthenticationRequired; 