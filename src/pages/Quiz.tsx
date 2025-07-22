import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, BookOpen, Building, Code, Users } from "lucide-react";
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
  const [companies, setCompanies] = useState<string[]>([]);

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
      const allCategories = (data || []) as QuizCategory[];
      setCategories(allCategories);
      
      // Extract unique companies (fallback if company field doesn't exist)
      const uniqueCompanies = [...new Set(allCategories.map(cat => cat.company || 'General').filter(Boolean))];
      setCompanies(uniqueCompanies);
    } catch (error) {
      console.error('Error fetching categories:', error);
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

  const getCategoryColor = (type: string) => {
    switch (type) {
      case 'technical':
        return 'bg-blue-100 text-blue-600 hover:bg-blue-200';
      case 'company':
        return 'bg-green-100 text-green-600 hover:bg-green-200';
      case 'hr':
        return 'bg-purple-100 text-purple-600 hover:bg-purple-200';
      default:
        return 'bg-gray-100 text-gray-600 hover:bg-gray-200';
    }
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
                Quiz Categories
              </h1>
              <p className="text-sm text-muted-foreground">Choose your interview focus area</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Company & Role Based Quizzes</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose a company and role to practice targeted interview questions
          </p>
        </div>

        {/* Company Selection */}
        <div className="max-w-4xl mx-auto mb-8">
          <h3 className="text-xl font-semibold mb-4 text-center">Select Company</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {companies.map((company) => (
              <Button
                key={company}
                variant={selectedCompany === company ? "default" : "outline"}
                onClick={() => setSelectedCompany(company)}
                className="h-12 text-sm"
              >
                {company}
              </Button>
            ))}
          </div>
        </div>

{!selectedCompany ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Please select a company to see available roles.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold mb-6 text-center">Choose Role for {selectedCompany}</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {categories
                .filter(category => (category.company || 'General') === selectedCompany)
                .map((category) => (
                  <Card key={category.id} className="cursor-pointer hover:shadow-lg transition-all group">
                    <CardHeader className="text-center">
                      <div className={`mx-auto h-16 w-16 rounded-lg flex items-center justify-center transition-colors ${getCategoryColor(category.type)}`}>
                        {getCategoryIcon(category.type)}
                      </div>
                      <CardTitle className="text-xl">{category.role || category.type} Role</CardTitle>
                      <Badge variant="secondary" className="w-fit mx-auto">
                        {category.company || 'General'}
                      </Badge>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-muted-foreground mb-4">{category.description}</p>
                      <Button className="w-full" onClick={() => navigate(`/quiz/${category.id}`)}>
                        Start {category.role || category.type} Quiz
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
      <BottomNavigation />
    </div>
  );
};

export default Quiz;