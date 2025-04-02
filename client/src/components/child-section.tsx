import { motion, AnimatePresence } from "framer-motion";
import { PointCircle } from "./point-circle";
import { Skeleton } from "@/components/ui/skeleton";

interface ChildSectionProps {
  name: string;
  color: string;
  colorClass: string;
  textColorClass: string;
  points: number[];
  onTogglePoint: (pointIndex: number) => void;
  isLoading: boolean;
}

export function ChildSection({
  name,
  color,
  colorClass,
  textColorClass,
  points,
  onTogglePoint,
  isLoading
}: ChildSectionProps) {
  // Generate array of 20 points
  const pointsArray = Array.from({ length: 20 }, (_, i) => i + 1);
  
  return (
    <div className="w-full bg-white rounded-2xl shadow-md overflow-hidden relative">
      <div className={`${colorClass} text-white py-4 px-6 flex justify-between items-center`}>
        <h2 className="text-2xl md:text-3xl font-bold">{name}</h2>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <Skeleton className="h-8 w-12 rounded-full bg-white/20" />
          ) : (
            <motion.div
              key={points.length}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className={`text-xl font-bold bg-white ${textColorClass} rounded-full px-3 py-1`}
            >
              {points.length}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="p-4 md:p-6">
        {/* Points Grid */}
        <div className="grid grid-cols-5 gap-3 md:gap-5 lg:gap-6">
          {isLoading ? (
            // Loading skeletons
            [...Array(20)].map((_, index) => (
              <Skeleton 
                key={index}
                className="aspect-square rounded-full"
              />
            ))
          ) : (
            // Points circles
            pointsArray.map((pointIndex) => (
              <PointCircle
                key={pointIndex}
                pointIndex={pointIndex}
                isFilled={points.includes(pointIndex)}
                color={color}
                colorClass={colorClass}
                textColorClass={textColorClass}
                onClick={() => onTogglePoint(pointIndex)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
