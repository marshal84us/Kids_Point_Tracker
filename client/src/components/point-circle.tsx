import { motion } from "framer-motion";

interface PointCircleProps {
  pointIndex: number;
  isFilled: boolean;
  color: string;
  colorClass: string;
  textColorClass: string;
  onClick: () => void;
}

export function PointCircle({
  pointIndex,
  isFilled,
  color,
  colorClass,
  textColorClass,
  onClick
}: PointCircleProps) {
  return (
    <motion.div
      className={`aspect-square rounded-full border-4 ${
        isFilled ? "bg-green-500 border-green-500" : `border-${color}-500`
      } flex items-center justify-center cursor-pointer transition-all hover:shadow-md`}
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      animate={isFilled ? { scale: [1, 1.2, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      <span className={`text-lg md:text-xl font-bold ${
        isFilled ? "text-white" : textColorClass
      }`}>
        {pointIndex}
      </span>
    </motion.div>
  );
}
