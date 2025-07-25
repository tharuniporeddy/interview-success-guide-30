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
  const [categories, setCategories] = useState<QuizCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  
  // Predefined companies with enhanced data
  const companies = [
    { name: "Google", icon: "🔍", color: "from-blue-500 to-blue-600", description: "Search & Innovation" },
    { name: "Amazon", icon: "📦", color: "from-orange-500 to-orange-600", description: "E-commerce & Cloud" },
    { name: "Microsoft", icon: "🪟", color: "from-blue-600 to-indigo-600", description: "Software & Cloud" },
    { name: "Meta", icon: "📘", color: "from-blue-500 to-blue-700", description: "Social & VR" },
    { name: "Apple", icon: "🍎", color: "from-gray-700 to-gray-900", description: "Consumer Tech" },
    { name: "Netflix", icon: "🎬", color: "from-red-500 to-red-600", description: "Streaming & Content" },
    { name: "Uber", icon: "🚗", color: "from-black to-gray-800", description: "Mobility & Delivery" },
    { name: "Airbnb", icon: "🏠", color: "from-pink-500 to-rose-500", description: "Travel & Hospitality" },
    { name: "Infosys", icon: "💼", color: "from-blue-500 to-blue-700", description: "IT Services" },
    { name: "TCS", icon: "🏢", color: "from-indigo-500 to-indigo-700", description: "Technology Consulting" },
    { name: "Wipro", icon: "⚡", color: "from-orange-500 to-yellow-500", description: "Digital Solutions" },
    { name: "Accenture", icon: "📊", color: "from-purple-500 to-purple-700", description: "Consulting & Services" }
  ];

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    fetchCategories();
  }, [user, loading, navigate]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_categories')
        .select('*')
        .order('company, role');

      if (error) throw error;
      setCategories((data || []) as QuizCategory[]);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Create default categories for each company if none exist
      const defaultCategories: QuizCategory[] = [];
      companies.forEach((company, index) => {
        defaultCategories.push(
          {
            id: `${company.name}-technical-${index}`,
            name: `${company.name} Technical Interview`,
            description: `Technical interview preparation for ${company.name}`,
            type: 'technical',
            company: company.name,
            role: 'technical'
          },
          {
            id: `${company.name}-hr-${index}`,
            name: `${company.name} HR Interview`, 
            description: `HR interview preparation for ${company.name}`,
            type: 'hr',
            company: company.name,
            role: 'hr'
          }
        );
      });
      setCategories(defaultCategories);
    } finally {
      setLoadingCategories(false);
    }
  };

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'technical':
        return <Code className="h-6 w-6" />;
      case 'company':
        return <Building className="h-6 w-6" />;
      case 'hr':
        return <Users className="h-6 w-6" />;
      default:
        return <BookOpen className="h-6 w-6" />;
    }
  };

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

  const getCompanyByName = (name: string) => {
    return companies.find(c => c.name === name) || companies[0];
  };

  if (loading || loadingCategories) {
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
            Choose Your Target Company
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Practice with AI-generated questions specifically designed for your chosen company and role. 
            Get 10-15 tailored questions to ace your interview!
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 flex-1">
        {/* Company Grid */}
        <div className="max-w-7xl mx-auto mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {companies.map((company) => (
              <Card 
                key={company.name}
                className={`group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 ${
                  selectedCompany === company.name 
                    ? 'border-primary shadow-lg ring-2 ring-primary/20' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedCompany(company.name)}
              >
                <CardHeader className="pb-4">
                  <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${company.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    {company.icon}
                  </div>
                  <CardTitle className="text-center text-lg font-bold">{company.name}</CardTitle>
                  <p className="text-sm text-muted-foreground text-center">{company.description}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button 
                    variant={selectedCompany === company.name ? "default" : "outline"} 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                  >
                    <Briefcase className="h-4 w-4 mr-2" />
                    View Roles
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

{!selectedCompany ? (
          <Card className="max-w-2xl mx-auto bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-dashed border-primary/30">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-6">
                <Building className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Select a Company Above
              </h3>
              <p className="text-muted-foreground text-lg">
                Choose from top tech companies and get personalized interview questions tailored to their hiring process.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getCompanyByName(selectedCompany).color} flex items-center justify-center text-xl shadow-lg`}>
                  {getCompanyByName(selectedCompany).icon}
                </div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {selectedCompany} Interview Prep
                </h3>
              </div>
              <p className="text-lg text-muted-foreground">
                Choose your role and start practicing with AI-generated questions
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Technical Role */}
              <Card className="group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl border-2 hover:border-primary/50 bg-gradient-to-br from-card via-card to-primary/5">
                <CardHeader className="text-center pb-6">
                  <div className={`mx-auto h-20 w-20 rounded-2xl bg-gradient-to-br ${getRoleColor('technical')} flex items-center justify-center transition-transform group-hover:scale-110 duration-300 shadow-lg mb-4`}>
                    <Code className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold mb-2">Technical Interview</CardTitle>
                  <p className="text-muted-foreground">
                    Coding challenges, system design, and technical problem-solving questions
                  </p>
                  <div className="flex justify-center gap-2 mt-4">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">Algorithms</Badge>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">System Design</Badge>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">Coding</Badge>
                  </div>
                </CardHeader>
                <CardContent className="text-center">
                  <Button 
                    className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 group-hover:shadow-lg" 
                    onClick={() => {
                      const categoryId = `${selectedCompany}-technical`;
                      // Navigate directly to quiz taking with company and role info
                      navigate(`/quiz/${categoryId}`, { 
                        state: { 
                          company: selectedCompany, 
                          role: 'technical',
                          categoryName: `${selectedCompany} Technical Interview`
                        } 
                      });
                    }}
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Start Technical Prep
                    <Sparkles className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* HR Role */}
              <Card className="group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl border-2 hover:border-primary/50 bg-gradient-to-br from-card via-card to-secondary/5">
                <CardHeader className="text-center pb-6">
                  <div className={`mx-auto h-20 w-20 rounded-2xl bg-gradient-to-br ${getRoleColor('hr')} flex items-center justify-center transition-transform group-hover:scale-110 duration-300 shadow-lg mb-4`}>
                    <Users className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold mb-2">HR Interview</CardTitle>
                  <p className="text-muted-foreground">
                    Behavioral questions, company culture fit, and leadership scenarios
                  </p>
                  <div className="flex justify-center gap-2 mt-4">
                    <Badge variant="secondary" className="bg-pink-100 text-pink-700">Behavioral</Badge>
                    <Badge variant="secondary" className="bg-violet-100 text-violet-700">Culture Fit</Badge>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700">Leadership</Badge>
                  </div>
                </CardHeader>
                <CardContent className="text-center">
                  <Button 
                    className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 group-hover:shadow-lg" 
                    onClick={() => {
                      const categoryId = `${selectedCompany}-hr`;
                      // Navigate directly to quiz taking with company and role info
                      navigate(`/quiz/${categoryId}`, { 
                        state: { 
                          company: selectedCompany, 
                          role: 'hr',
                          categoryName: `${selectedCompany} HR Interview`
                        } 
                      });
                    }}
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Start HR Prep
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
                  Each quiz contains 10-15 carefully crafted questions specific to {selectedCompany}'s interview process, 
                  covering different difficulty levels and topics relevant to your chosen role.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <Footer />
      <BottomNavigation />
    </div>
  );
};

export default Quiz;