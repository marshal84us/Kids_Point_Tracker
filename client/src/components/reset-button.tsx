import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface ResetButtonProps {
  onClick: () => void;
}

export function ResetButton({ onClick }: ResetButtonProps) {
  return (
    <div className="flex justify-center mb-6">
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button 
          variant="outline" 
          onClick={onClick}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-full flex items-center transition-all shadow-sm hover:shadow"
        >
          <RefreshCw className="h-5 w-5 mr-2" />
          Reset All Points
        </Button>
      </motion.div>
    </div>
  );
}
