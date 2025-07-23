import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Lightbulb, AlertTriangle, Sparkles } from "lucide-react";
import Footer from "@/components/Footer";
import BottomNavigation from "@/components/BottomNavigation";
import CompanyRoleSelector from "@/components/CompanyRoleSelector";
import QuizProgress from "@/components/QuizProgress";
import VideoSearch from "@/components/VideoSearch";

interface AiTip {
  tip: string;
}

const InterviewPrep = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState<'selection' | 'quiz' | 'results'>('selection');
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [quizStarting, setQuizStarting] = useState(false);
  const [aiTips, setAiTips] = useState<AiTip[]>([]);
  const [loadingTips, setLoadingTips] = useState(false);
  const [tipsError, setTipsError] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }
  }, [user, loading, navigate]);

  const fetchAiTips = async (role: string, company: string) => {
    setLoadingTips(true);
    setTipsError(false);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-tips', {
        body: { role: role.toLowerCase(), topic: `${company} interview` }
      });

      if (error) throw error;
      
      if (data?.tips && Array.isArray(data.tips)) {
        setAiTips(data.tips);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching AI tips:', error);
      setTipsError(true);
      // Fallback tips
      setAiTips([
        { tip: "Be confident, clear, and keep your answers structured. Use real experiences!" },
        { tip: "Demonstrate problem-solving with STAR method when answering behavioral questions." },
        { tip: `Research ${company}'s values and recent developments before the interview.` }
      ]);
    } finally {
      setLoadingTips(false);
    }
  };

  const handleStartQuiz = async (company: string, role: string) => {
    setQuizStarting(true);
    setSelectedCompany(company);
    setSelectedRole(role);

    // Fetch AI tips for the selected role and company
    await fetchAiTips(role, company);

    // Simulate quiz preparation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setCurrentStep('quiz');
    setQuizStarting(false);
    
    toast({
      title: "🧠 Good luck!",
      description: `Starting ${company} ${role} interview preparation. Let's ace it!`,
    });
  };

  const handleBackToSelection = () => {
    setCurrentStep('selection');
    setSelectedCompany("");
    setSelectedRole("");
    setAiTips([]);
  };

  const handleViewReport = () => {
    toast({
      title: "Coming Soon",
      description: "Detailed analytics report will be available soon!",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 flex flex-col">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Interview Preparation Hub
              </h1>
              <p className="text-sm text-muted-foreground">
                {currentStep === 'selection' ? 'Choose your interview type and get personalized preparation' :
                 currentStep === 'quiz' ? `Preparing for ${selectedCompany} ${selectedRole} Interview` :
                 'Review your performance and progress'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-1 space-y-8">
        {currentStep === 'selection' && (
          <CompanyRoleSelector 
            onStartQuiz={handleStartQuiz}
            loading={quizStarting}
          />
        )}

        {currentStep === 'quiz' && (
          <>
            {/* Quiz Status */}
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-6">
                <div className="text-center space-y-2">
                  <Badge variant="default" className="text-sm">
                    🚀 Quiz Started
                  </Badge>
                  <h2 className="text-xl font-semibold">
                    📌 Company Selected: {selectedCompany}
                  </h2>
                  <h3 className="text-lg text-muted-foreground">
                    📌 Role: {selectedRole}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    ✅ Fetching questions specially designed for {selectedCompany}'s {selectedRole} Round...
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* AI Tips Section */}
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  🧠 Smart AI Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingTips ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Generating personalized tips...</p>
                  </div>
                ) : tipsError ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <span className="text-sm text-orange-800 dark:text-orange-200">
                        ⚠️ Sorry, we're unable to fetch smart tips right now.
                      </span>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                        💬 But don't worry! Here are some universal tips:
                      </p>
                      <div className="space-y-2">
                        {aiTips.map((tip, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <span className="text-blue-600 dark:text-blue-400">➡️</span>
                            <span className="text-sm text-blue-700 dark:text-blue-300">"{tip.tip}"</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {aiTips.map((tip, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <Lightbulb className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                        <span className="text-sm text-green-800 dark:text-green-200">
                          ✨ "{tip.tip}"
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Video Tutorials */}
            <div className="max-w-4xl mx-auto">
              <VideoSearch company={selectedCompany} role={selectedRole} />
            </div>

            {/* Navigation */}
            <div className="max-w-2xl mx-auto flex gap-4">
              <Button variant="outline" onClick={handleBackToSelection} className="flex-1">
                ← Back to Selection
              </Button>
              <Button onClick={() => setCurrentStep('results')} className="flex-1">
                View Progress →
              </Button>
            </div>
          </>
        )}

        {currentStep === 'results' && (
          <>
            <QuizProgress 
              onTakeAnotherQuiz={handleBackToSelection}
              onViewReport={handleViewReport}
            />
          </>
        )}
      </main>

      <Footer />
      <BottomNavigation />
    </div>
  );
};

export default InterviewPrep;