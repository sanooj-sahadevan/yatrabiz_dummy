import { SpinnerIcon } from "@/constants/icons";

export default function LoadingSpinner({ text = "Processing...", size = "h-3 w-3" }) {
  return (
    <span className="flex items-center">
      <SpinnerIcon size={size} />
      {text}
    </span>
  );
} 