import { Font } from "@react-pdf/renderer";
import { FONT_CONFIG } from "../../../constants/pdfConstants";

// Register fonts
Font.register(FONT_CONFIG);

// Format date utility function
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString)
    .toLocaleDateString("en-IN", options)
    .toUpperCase();
}; 