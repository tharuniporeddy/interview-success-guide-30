import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Search, Play, Clock, Heart, ExternalLink } from "lucide-react";
import Footer from "@/components/Footer";
import BottomNavigation from "@/components/BottomNavigation";

interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  youtube_url: string;
  thumbnail_url: string;
  category: string;
  duration_minutes: number;
}

const Videos = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [videos, setVideos] = useState<VideoTutorial[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<VideoTutorial[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const categories = ["all", "technical", "hr"];
  
  // Hardcoded videos based on role
  const staticVideos = {
    technical: [
      {
        id: 'tech-1',
        title: 'Technical Interview Preparation - Data Structures',
        description: 'Master the fundamentals of data structures for technical interviews',
        youtube_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnail_url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        category: 'technical',
        duration_minutes: 45
      },
      {
        id: 'tech-2',
        title: 'Coding Interview Tips & Tricks',
        description: 'Essential coding techniques and problem-solving strategies',
        youtube_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnail_url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        category: 'technical',
        duration_minutes: 30
      },
      {
        id: 'tech-3',
        title: 'System Design Interview Guide',
        description: 'Complete guide to system design interviews',
        youtube_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnail_url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        category: 'technical',
        duration_minutes: 60
      }
    ],
    hr: [
      {
        id: 'hr-1',
        title: 'HR Interview Questions & Answers',
        description: 'Most common HR interview questions and how to answer them',
        youtube_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnail_url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        category: 'hr',
        duration_minutes: 25
      },
      {
        id: 'hr-2',
        title: 'Tell Me About Yourself - Perfect Answer',
        description: 'How to craft the perfect answer to this common question',
        youtube_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnail_url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        category: 'hr',
        duration_minutes: 15
      },
      {
        id: 'hr-3',
        title: 'Behavioral Interview Strategies',
        description: 'STAR method and behavioral interview techniques',
        youtube_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnail_url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        category: 'hr',
        duration_minutes: 35
      }
    ]
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    fetchVideos();
  }, [user, loading, navigate]);

  useEffect(() => {
    filterVideos();
  }, [videos, selectedCategory]);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('video_tutorials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoadingVideos(false);
    }
  };

  const filterVideos = () => {
    let filtered = videos;

    if (selectedCategory !== "all") {
      filtered = filtered.filter(video => video.category === selectedCategory);
      
      // Add static videos based on selected category
      if (selectedCategory === "technical" && staticVideos.technical) {
        filtered = [...filtered, ...staticVideos.technical];
      } else if (selectedCategory === "hr" && staticVideos.hr) {
        filtered = [...filtered, ...staticVideos.hr];
      }
    }

    setFilteredVideos(filtered);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      // This would integrate with Gemini API to search for videos
      // For now, we'll show a placeholder
      const mockResults = [
        {
          id: 'search-1',
          title: `Best ${searchQuery} Interview Tips`,
          description: `Comprehensive guide for ${searchQuery} interview preparation`,
          thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
          duration: '15:30',
          url: 'https://youtube.com/watch?v=dQw4w9WgXcQ'
        },
        {
          id: 'search-2',
          title: `Common ${searchQuery} Interview Questions`,
          description: `Top questions asked in ${searchQuery} interviews`,
          thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
          duration: '22:45',
          url: 'https://youtube.com/watch?v=dQw4w9WgXcQ'
        }
      ];
      
      setSearchResults(mockResults);
    } catch (error) {
      console.error('Error searching videos:', error);
    } finally {
      setSearching(false);
    }
  };

  const toggleFavorite = (videoId: string) => {
    const newFavorites = new Set(favoriteIds);
    if (newFavorites.has(videoId)) {
      newFavorites.delete(videoId);
    } else {
      newFavorites.add(videoId);
    }
    setFavoriteIds(newFavorites);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getYouTubeVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  if (loading || loadingVideos) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading videos...</p>
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
                Video Tutorials
              </h1>
              <p className="text-sm text-muted-foreground">Watch expert interview guidance</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-1">
        {/* AI-Powered Search */}
        <Card className="max-w-4xl mx-auto mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              AI-Powered Video Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Search for interview videos (e.g., 'HR interview intro', 'technical coding tips')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={searching}>
                {searching ? 'Searching...' : 'Search'}
              </Button>
            </div>
            
            {searchResults.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-4">Search Results (Powered by AI)</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {searchResults.map((result) => (
                    <Card key={result.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <img 
                            src={result.thumbnail} 
                            alt={result.title}
                            className="w-24 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-sm leading-tight mb-1">{result.title}</h4>
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{result.description}</p>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                {result.duration}
                              </Badge>
                              <Button size="sm" variant="ghost" asChild>
                                <a href={result.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Filter */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Curated Videos */}
        <div className="max-w-6xl mx-auto">
          <h3 className="text-xl font-semibold mb-6">Curated Video Tutorials</h3>
          
          {filteredVideos.length === 0 ? (
            <Card className="max-w-md mx-auto">
              <CardContent className="p-8 text-center">
                <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No videos available in this category yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((video) => {
                const videoId = getYouTubeVideoId(video.youtube_url);
                const thumbnailUrl = video.thumbnail_url || 
                  (videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '');

                return (
                  <Card key={video.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                    <div className="relative">
                      <img 
                        src={thumbnailUrl} 
                        alt={video.title}
                        className="w-full h-48 object-cover"
                      />
                      <Button
                        size="sm"
                        className="absolute top-2 right-2"
                        variant="secondary"
                        onClick={() => toggleFavorite(video.id)}
                      >
                        <Heart 
                          className={`h-4 w-4 ${favoriteIds.has(video.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} 
                        />
                      </Button>
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Button size="lg" asChild>
                          <a href={video.youtube_url} target="_blank" rel="noopener noreferrer">
                            <Play className="h-6 w-6 mr-2" />
                            Watch
                          </a>
                        </Button>
                      </div>
                    </div>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <Badge variant="secondary" className="mb-2">
                            {video.category}
                          </Badge>
                          <CardTitle className="text-lg leading-tight">{video.title}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4 line-clamp-2">{video.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDuration(video.duration_minutes)}
                        </Badge>
                        <Button size="sm" variant="outline" asChild>
                          <a href={video.youtube_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Watch
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <BottomNavigation />
    </div>
  );
};

export default Videos;