import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, BookOpen, Building, Code, Users, Play, Sparkles, Briefcase, ChevronRight } from "lucide-react";
import Footer from "@/components/Footer";
import BottomNavigation from "@/components/BottomNavigation";

interface QuizCategory {
  id: string;
  name: string;
  description: string;
  type: string;
  company?: string;
  role?: string;
}

const Quiz = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }
  }, [user, loading, navigate]);

  const getRoleColor = (type: string) => {
    switch (type) {
      case 'technical':
        return 'from-blue-500 to-cyan-500';
      case 'hr':
        return 'from-purple-500 to-pink-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex flex-col">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/')} className="gap-2 hover:bg-primary/10">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Interview Preparation Hub
              </h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                AI-powered questions tailored for your dream company
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 py-12 text-center relative">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Choose Your Interview Round
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Start with either Technical or HR round. Get 10-15 AI-generated questions tailored for your preparation!
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Technical Round */}
            <Card className="group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl border-2 hover:border-primary/50 bg-gradient-to-br from-card via-card to-primary/5">
              <CardHeader className="text-center pb-6">
                <div className={`mx-auto h-20 w-20 rounded-2xl bg-gradient-to-br ${getRoleColor('technical')} flex items-center justify-center transition-transform group-hover:scale-110 duration-300 shadow-lg mb-4`}>
                  <Code className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold mb-2">Technical Round</CardTitle>
                <p className="text-muted-foreground">
                  Programming, algorithms, data structures, and computer science fundamentals
                </p>
                <div className="flex justify-center gap-2 mt-4 flex-wrap">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">JavaScript</Badge>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">DSA</Badge>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">DBMS</Badge>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700">OOPs</Badge>
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 group-hover:shadow-lg" 
                  onClick={() => {
                    navigate(`/quiz/technical-round`, { 
                      state: { 
                        role: 'technical',
                        categoryName: 'Technical Round'
                      } 
                    });
                  }}
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start Technical Round
                  <Sparkles className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* HR Round */}
            <Card className="group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl border-2 hover:border-primary/50 bg-gradient-to-br from-card via-card to-secondary/5">
              <CardHeader className="text-center pb-6">
                <div className={`mx-auto h-20 w-20 rounded-2xl bg-gradient-to-br ${getRoleColor('hr')} flex items-center justify-center transition-transform group-hover:scale-110 duration-300 shadow-lg mb-4`}>
                  <Users className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold mb-2">HR Round</CardTitle>
                <p className="text-muted-foreground">
                  Behavioral questions, leadership scenarios, and personality assessment
                </p>
                <div className="flex justify-center gap-2 mt-4 flex-wrap">
                  <Badge variant="secondary" className="bg-pink-100 text-pink-700">Behavioral</Badge>
                  <Badge variant="secondary" className="bg-violet-100 text-violet-700">Leadership</Badge>
                  <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">Communication</Badge>
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">Teamwork</Badge>
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 group-hover:shadow-lg" 
                  onClick={() => {
                    navigate(`/quiz/hr-round`, { 
                      state: { 
                        role: 'hr',
                        categoryName: 'HR Round'
                      } 
                    });
                  }}
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start HR Round
                  <Sparkles className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Additional Info */}
          <Card className="mt-8 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 border border-primary/20">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-semibold text-primary">AI-Powered Questions</span>
              </div>
              <p className="text-muted-foreground">
                Each quiz contains 10-15 carefully crafted questions. Technical rounds use AI to generate programming and CS questions, 
                while HR rounds provide general behavioral and personality questions.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
      <BottomNavigation />
    </div>
  );
};

export default Quiz;