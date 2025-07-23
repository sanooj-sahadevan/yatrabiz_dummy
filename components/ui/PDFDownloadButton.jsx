import React, { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import { SpinnerIcon, ArrowRightIcon } from "@/constants/icons";
import { Document, Page, Text } from "@react-pdf/renderer";

const PDFDownloadButton = ({
  children,
  pdfComponent: PDFComponent,
  data,
  filename,
  className = "",
  disabled = false,
  loadingText = "Generating PDF...",
  ...props
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (!PDFComponent || !data || isGenerating) return;

    setIsGenerating(true);

    try {
      const blob = await pdf(<PDFComponent {...data} />).toBlob();

      saveAs(blob, filename || "document.pdf");
      toast.success(`${filename || "Document"} downloaded successfully!`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={disabled || isGenerating}
      className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm bg-transparent border border-black text-black hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
      {...props}
    >
      {isGenerating ? (
        <>
          <SpinnerIcon className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" />
          {loadingText}
        </>
      ) : (
        <>
          <ArrowRightIcon className="w-4 h-4 mr-2 text-black" />
          {children}
        </>
      )}
    </button>
  );
};

export default PDFDownloadButton;
