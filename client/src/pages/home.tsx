import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ChildSection } from "@/components/child-section";
import { ResetButton } from "@/components/reset-button";
import { ResetModal } from "@/components/reset-modal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const { user, logout, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && (!user || !user.authenticated)) {
      setLocation("/login");
    }
  }, [user, authLoading, setLocation]);

  // Define the Points type
  type Points = {
    adrian: number[], 
    emma: number[],
    goals: {
      adrian: number,
      emma: number
    },
    savings: {
      adrian: number,
      emma: number
    }
  };

  // Fetch points data from the server
  const { data, isLoading } = useQuery<Points>({
    queryKey: ['/api/points'],
    staleTime: 0 // Always get the latest points
  });

  // Update points mutation
  const updatePointsMutation = useMutation({
    mutationFn: async (pointsData: Points) => {
      await apiRequest('POST', '/api/points', pointsData);
      return pointsData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/points'] });
    }
  });

  // Reset points for a specific child
  const resetChildPointsMutation = useMutation({
    mutationFn: async (child: 'adrian' | 'emma') => {
      if (!data) return {};
      
      // Create a copy of the current points
      const pointsData = {
        adrian: [...(data.adrian || [])],
        emma: [...(data.emma || [])],
        goals: data.goals || { adrian: 0, emma: 0 },
        savings: data.savings || { adrian: 0, emma: 0 }
      };
      
      // Reset only the specified child's points
      pointsData[child] = [];
      
      // Update server
      await apiRequest('POST', '/api/points', pointsData);
      return pointsData;
    },
    onSuccess: () => {
      // Invalidate query to refresh UI
      queryClient.invalidateQueries({ queryKey: ['/api/points'] });
      
      // Close modal
      setIsResetModalOpen(false);
    }
  });
  
  // Update money values mutation
  const updateMoneyMutation = useMutation({
    mutationFn: async ({ type, child, value }: { type: 'goal' | 'savings', child: 'adrian' | 'emma', value: number }) => {
      if (!data) return {};
      
      const updatedMoney = {
        goals: { ...data.goals },
        savings: { ...data.savings }
      };
      
      // Update the specified money value
      if (type === 'goal') {
        updatedMoney.goals[child] = value;
      } else {
        updatedMoney.savings[child] = value;
      }
      
      // Send to server
      await apiRequest('POST', '/api/money', updatedMoney);
      return updatedMoney;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/points'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update money values",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Toggle point handler
  const handleTogglePoint = (child: 'adrian' | 'emma', pointIndex: number) => {
    // Only parents (admin role) can modify points
    if (!data || user?.role !== 'admin') return;
    
    // Create a copy of the current points
    const pointsData = {
      adrian: [...(data.adrian || [])],
      emma: [...(data.emma || [])],
      goals: { ...data.goals },
      savings: { ...data.savings }
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
  
  // Handle money value updates
  const handleMoneyUpdate = (child: 'adrian' | 'emma', type: 'goal' | 'savings', value: number) => {
    updateMoneyMutation.mutate({ type, child, value });
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
  };

  // State to track which child is being reset
  const [childToReset, setChildToReset] = useState<'adrian' | 'emma' | null>(null);

  // Handle reset button click for a specific child
  const handleResetClick = (child: 'adrian' | 'emma') => {
    setChildToReset(child);
    setIsResetModalOpen(true);
  };

  // Handle reset confirmation
  const handleResetConfirm = () => {
    if (childToReset) {
      resetChildPointsMutation.mutate(childToReset);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header and User Info */}
        <header className="mb-6 max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Kids Points Tracker</h1>
              {user && user.role === 'admin' ? (
                <p className="text-gray-600 mt-2"></p>
              ) : (
                <p className="text-gray-600 mt-2"></p>
              )}
            </div>
            <div className="flex items-center gap-3 mt-4 sm:mt-0">
              <div className="text-sm text-gray-600">
                Logged in as: <span className="font-semibold">{user?.username}</span>
              </div>
              <Button onClick={handleLogout} variant="outline" size="sm">
                Log out
              </Button>
            </div>
          </div>
          <p className="text-center text-gray-600 mb-6">
            {user && user.role === 'admin' 
              ? "Tap the circles to award points!" 
              : user?.childView === 'adrian'
                ? "Welcome Adrian! Here are your points."
                : user?.childView === 'emma'
                  ? "Welcome Emma! Here are your points."
                  : "You can see the points but can't change them."}
          </p>
        </header>

        {/* Main content */}
        <div className="flex flex-col md:flex-row justify-center max-w-screen-xl mx-auto gap-6 md:gap-10">
          {/* Show Adrian's section if user is admin or if user is specifically 'adrian' */}
          {(user?.role === 'admin' || user?.childView === 'adrian') && (
            <div className="flex-1 md:max-w-md">
              {/* Reset Button for Adrian - Only visible to parents (admin role) */}
              {user && user.role === 'admin' && (
                <div className="flex justify-center mb-4">
                  <ResetButton 
                    onClick={() => handleResetClick('adrian')} 
                    childName="Adrian" 
                    color="blue"
                  />
                </div>
              )}
            
              <ChildSection 
                name="Adrian" 
                color="blue" 
                colorClass="bg-blue-600" 
                textColorClass="text-blue-600" 
                points={data?.adrian || []} 
                goal={data?.goals?.adrian || 0}
                savings={data?.savings?.adrian || 0}
                onTogglePoint={(pointIndex) => handleTogglePoint('adrian', pointIndex)} 
                onUpdateMoney={(type, value) => handleMoneyUpdate('adrian', type, value)}
                isLoading={isLoading}
                isAdmin={user?.role === 'admin'}
              />
            </div>
          )}
          
          {/* Show Emma's section if user is admin or if user is specifically 'emma' */}
          {(user?.role === 'admin' || user?.childView === 'emma') && (
            <div className="flex-1 md:max-w-md">
              {/* Reset Button for Emma - Only visible to parents (admin role) */}
              {user && user.role === 'admin' && (
                <div className="flex justify-center mb-4">
                  <ResetButton 
                    onClick={() => handleResetClick('emma')} 
                    childName="Emma" 
                    color="pink"
                  />
                </div>
              )}
              
              <ChildSection 
                name="Emma" 
                color="pink" 
                colorClass="bg-pink-500" 
                textColorClass="text-pink-500" 
                points={data?.emma || []} 
                goal={data?.goals?.emma || 0}
                savings={data?.savings?.emma || 0}
                onTogglePoint={(pointIndex) => handleTogglePoint('emma', pointIndex)} 
                onUpdateMoney={(type, value) => handleMoneyUpdate('emma', type, value)}
                isLoading={isLoading}
                isAdmin={user?.role === 'admin'}
              />
            </div>
          )}
          

        </div>

        {/* Reset Confirmation Modal */}
        <ResetModal 
          isOpen={isResetModalOpen} 
          onClose={() => setIsResetModalOpen(false)} 
          onConfirm={handleResetConfirm}
          childName={childToReset === 'adrian' ? 'Adrian' : childToReset === 'emma' ? 'Emma' : undefined}
        />

        {/* Footer */}
        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Kids Points Tracker</p>
        </footer>
      </div>
    </div>
  );
}
