import { motion, AnimatePresence } from "framer-motion";
import { PointCircle } from "./point-circle";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { DollarSign } from "lucide-react";
import { useState, useEffect } from "react";

interface ChildSectionProps {
  name: string;
  color: string;
  colorClass: string;
  textColorClass: string;
  points: number[];
  goal: number;
  savings: number;
  onTogglePoint: (pointIndex: number) => void;
  onUpdateMoney?: (type: 'goal' | 'savings', value: number) => void;
  isLoading: boolean;
  isAdmin: boolean;
}

export function ChildSection({
  name,
  color,
  colorClass,
  textColorClass,
  points,
  goal = 0,
  savings = 0, 
  onTogglePoint,
  onUpdateMoney,
  isLoading,
  isAdmin = false
}: ChildSectionProps) {
  // Generate array of 20 points
  const pointsArray = Array.from({ length: 20 }, (_, i) => i + 1);
  
  // State for goal and savings input values
  const [goalValue, setGoalValue] = useState(goal);
  const [savingsValue, setSavingsValue] = useState(savings);
  
  // Update local state when props change
  useEffect(() => {
    setGoalValue(goal);
    setSavingsValue(savings);
  }, [goal, savings]);

  // Handle input change and debounced update
  const handleMoneyChange = (type: 'goal' | 'savings', value: string) => {
    const numValue = parseFloat(value) || 0;
    
    if (type === 'goal') {
      setGoalValue(numValue);
    } else {
      setSavingsValue(numValue);
    }
    
    // Only send update if admin and onUpdateMoney is provided
    if (isAdmin && onUpdateMoney) {
      onUpdateMoney(type, numValue);
    }
  };
  
  // Calculate goal deficit (how much more needed to reach goal)
  const goalDeficit = Math.max(goalValue - savingsValue, 0);
  
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
        {/* Money Goals and Savings Section */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center space-x-3">
            <div className={`font-semibold ${textColorClass} w-32 text-base`}>My Goal:</div>
            <div className="relative flex-1 max-w-[160px]">
              <DollarSign className={`absolute left-2 top-2.5 h-4 w-4 ${textColorClass}`} />
              {isAdmin ? (
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={goalValue}
                  onChange={(e) => handleMoneyChange('goal', e.target.value)}
                  className={`pl-8 font-bold text-lg bg-white ${textColorClass} border-[2px] border-${colorClass.replace('bg-', '')}`}
                />
              ) : (
                <div className={`pl-8 pr-2 py-2 font-bold text-lg bg-white ${textColorClass} border-[2px] border-gray-200 rounded-md h-10 flex items-center`}>
                  {goalValue}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className={`font-semibold ${textColorClass} w-32 text-base`}>My Savings:</div>
            <div className="relative flex-1 max-w-[160px]">
              <DollarSign className={`absolute left-2 top-2.5 h-4 w-4 ${textColorClass}`} />
              {isAdmin ? (
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={savingsValue}
                  onChange={(e) => handleMoneyChange('savings', e.target.value)}
                  className={`pl-8 font-bold text-lg bg-white ${textColorClass} border-[2px] border-${colorClass.replace('bg-', '')}`}
                />
              ) : (
                <div className={`pl-8 pr-2 py-2 font-bold text-lg bg-white ${textColorClass} border-[2px] border-gray-200 rounded-md h-10 flex items-center`}>
                  {savingsValue}
                </div>
              )}
            </div>
          </div>
          
          {/* Goal Deficit (How much more needed) */}
          <div className="flex items-center space-x-3">
            <div className={`font-semibold ${textColorClass} w-32 text-base`}>Still Need:</div>
            <div className="relative flex-1 max-w-[160px]">
              <DollarSign className={`absolute left-2 top-2.5 h-4 w-4 text-green-600`} />
              <div className="pl-8 pr-2 py-2 font-bold text-lg bg-white text-green-600 border-[2px] border-gray-200 rounded-md h-10 flex items-center">
                {goalDeficit}
              </div>
            </div>
          </div>
        </div>
        
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
