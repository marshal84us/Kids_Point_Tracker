import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ChildSection } from "@/components/child-section";
import { ResetButton } from "@/components/reset-button";
import { ResetModal } from "@/components/reset-modal";

export default function Home() {
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Fetch points data from the server
  const { data, isLoading } = useQuery({
    queryKey: ['/api/points'],
    staleTime: 0 // Always get the latest points
  });

  // Update points mutation
  const updatePointsMutation = useMutation({
    mutationFn: async (pointsData: { adrian: number[], emma: number[] }) => {
      await apiRequest('POST', '/api/points', pointsData);
      return pointsData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/points'] });
    }
  });

  // Reset points mutation
  const resetPointsMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/points/reset', {});
      return {};
    },
    onSuccess: () => {
      // Invalidate query to refresh UI
      queryClient.invalidateQueries({ queryKey: ['/api/points'] });
      
      // Close modal
      setIsResetModalOpen(false);
    }
  });

  // Toggle point handler
  const handleTogglePoint = (child: 'adrian' | 'emma', pointIndex: number) => {
    if (!data) return;
    
    // Create a copy of the current points
    const pointsData = {
      adrian: [...data.adrian || []],
      emma: [...data.emma || []]
    };
    
    // Toggle the point
    const pointArray = pointsData[child];
    const pointExists = pointArray.includes(pointIndex);
    
    if (pointExists) {
      // Remove point
      pointsData[child] = pointArray.filter(p => p !== pointIndex);
    } else {
      // Add point
      pointsData[child] = [...pointArray, pointIndex];
    }
    
    // Update server
    updatePointsMutation.mutate(pointsData);
  };

  // Handle reset button click
  const handleResetClick = () => {
    setIsResetModalOpen(true);
  };

  // Handle reset confirmation
  const handleResetConfirm = () => {
    resetPointsMutation.mutate();
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <header className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Kids Points Tracker</h1>
          <p className="text-gray-600 mt-2">Tap the circles to award points!</p>
        </header>

        {/* Reset Button */}
        <ResetButton onClick={handleResetClick} />

        {/* Main content */}
        <div className="flex flex-col md:flex-row gap-6">
          <ChildSection 
            name="Adrian" 
            color="blue" 
            colorClass="bg-blue-600" 
            textColorClass="text-blue-600" 
            points={data?.adrian || []} 
            onTogglePoint={(pointIndex) => handleTogglePoint('adrian', pointIndex)} 
            isLoading={isLoading}
          />
          
          <ChildSection 
            name="Emma" 
            color="pink" 
            colorClass="bg-pink-500" 
            textColorClass="text-pink-500" 
            points={data?.emma || []} 
            onTogglePoint={(pointIndex) => handleTogglePoint('emma', pointIndex)} 
            isLoading={isLoading}
          />
        </div>

        {/* Reset Confirmation Modal */}
        <ResetModal 
          isOpen={isResetModalOpen} 
          onClose={() => setIsResetModalOpen(false)} 
          onConfirm={handleResetConfirm} 
        />

        {/* Footer */}
        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Kids Points Tracker</p>
        </footer>
      </div>
    </div>
  );
}
