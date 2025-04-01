import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface ResetButtonProps {
  onClick: () => void;
  childName?: string;
  color?: string;
}

export function ResetButton({ onClick, childName, color }: ResetButtonProps) {
  const buttonClasses = color === "blue" 
    ? "bg-blue-100 hover:bg-blue-200 text-blue-700" 
    : color === "pink" 
      ? "bg-pink-100 hover:bg-pink-200 text-pink-700"
      : "bg-gray-200 hover:bg-gray-300 text-gray-700";

  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mb-3">
      <Button 
        variant="outline" 
        onClick={onClick}
        className={`${buttonClasses} font-semibold py-2 px-4 rounded-full flex items-center transition-all shadow-sm hover:shadow`}
      >
        <RefreshCw className="h-5 w-5 mr-2" />
        {childName ? `Reset ${childName}'s Points` : "Reset All Points"}
      </Button>
    </motion.div>
  );
}
