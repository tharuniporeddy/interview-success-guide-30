import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Search, Heart, BookOpen, Copy, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import Footer from "@/components/Footer";
import BottomNavigation from "@/components/BottomNavigation";

interface InterviewTip {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
}

const Tips = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [tips, setTips] = useState<InterviewTip[]>([]);
  const [filteredTips, setFilteredTips] = useState<InterviewTip[]>([]);
  const [loadingTips, setLoadingTips] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [aiTips, setAiTips] = useState<string[]>([]);
  const [loadingAiTips, setLoadingAiTips] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const categories = ["all", "technical", "hr", "behavioral", "general"];

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    fetchTips();
  }, [user, loading, navigate]);

  useEffect(() => {
    filterTips();
  }, [tips, searchQuery, selectedCategory]);

  const fetchTips = async () => {
    try {
      const { data, error } = await supabase
        .from('interview_tips')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTips(data || []);
    } catch (error) {
      console.error('Error fetching tips:', error);
    } finally {
      setLoadingTips(false);
    }
  };

  const filterTips = () => {
    let filtered = tips;

    if (selectedCategory !== "all") {
      filtered = filtered.filter(tip => tip.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(tip =>
        tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tip.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tip.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredTips(filtered);
  };

  const generateAiTips = async (role: string) => {
    if (role === "all") return;
    
    setLoadingAiTips(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-tips', {
        body: { role, topic: searchQuery }
      });

      if (error) throw new Error('Failed to generate tips');
      
      setAiTips(data?.tips || []);
    } catch (error) {
      console.error('Error generating AI tips:', error);
      toast.error('Failed to generate AI tips');
    } finally {
      setLoadingAiTips(false);
    }
  };

  const copyTip = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast.success('Tip copied to clipboard!');
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      toast.error('Failed to copy tip');
    }
  };

  const toggleFavorite = (tipId: string) => {
    const newFavorites = new Set(favoriteIds);
    if (newFavorites.has(tipId)) {
      newFavorites.delete(tipId);
    } else {
      newFavorites.add(tipId);
    }
    setFavoriteIds(newFavorites);
  };

  if (loading || loadingTips) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading tips...</p>
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
                Interview Tips & Tricks
              </h1>
              <p className="text-sm text-muted-foreground">Expert advice for interview success</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-1">
        {/* Search and Filter */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search tips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedCategory(category);
                  if (category !== "all") {
                    generateAiTips(category);
                  } else {
                    setAiTips([]);
                  }
                }}
                className="capitalize"
              >
                {category}
              </Button>
            ))}
          </div>

          {selectedCategory !== "all" && (
            <Button 
              onClick={() => generateAiTips(selectedCategory)}
              disabled={loadingAiTips}
              className="mb-4"
            >
              {loadingAiTips ? 'Generating...' : `Generate AI Tips for ${selectedCategory}`}
            </Button>
          )}
        </div>

        {/* AI Generated Tips */}
        {aiTips.length > 0 && (
          <div className="max-w-4xl mx-auto mb-8">
            <h3 className="text-xl font-semibold mb-4">AI Generated {selectedCategory} Tips</h3>
            <div className="space-y-3">
              {aiTips.map((tip, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-start gap-4">
                    <p className="text-sm flex-1">{tip}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyTip(tip, index)}
                      className="flex-shrink-0"
                    >
                      {copiedIndex === index ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tips Grid */}
        {filteredTips.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery || selectedCategory !== "all" 
                  ? "No tips found matching your criteria." 
                  : "No tips available yet."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {filteredTips.map((tip) => (
              <Card key={tip.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <Badge variant="secondary" className="mb-2">
                        {tip.category}
                      </Badge>
                      <CardTitle className="text-lg leading-tight">{tip.title}</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(tip.id)}
                      className="p-1 h-8 w-8"
                    >
                      <Heart 
                        className={`h-4 w-4 ${favoriteIds.has(tip.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} 
                      />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-3">{tip.content}</p>
                  <div className="flex justify-between items-center mb-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyTip(tip.content, parseInt(tip.id))}
                      className="gap-2"
                    >
                      {copiedIndex === parseInt(tip.id) ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      Copy
                    </Button>
                  </div>
                  {tip.tags && tip.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {tip.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {tip.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{tip.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
      <BottomNavigation />
    </div>
  );
};

export default Tips;