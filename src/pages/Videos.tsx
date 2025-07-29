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
        title: 'Python Interview Questions & Answers for Developers',
        description: 'Top Python interview questions and coding challenges. Essential for Python developer interviews covering data structures, algorithms, and Python concepts.',
        youtube_url: 'https://youtube.com/watch?v=rfscVS0vtbw',
        thumbnail_url: 'https://img.youtube.com/vi/rfscVS0vtbw/maxresdefault.jpg',
        category: 'technical',
        duration_minutes: 35
      },
      {
        id: 'tech-2',
        title: 'Java Interview Questions & Answers',
        description: 'Common Java interview questions and detailed answers. Perfect for Java developer interviews covering OOP, collections, and Java fundamentals.',
        youtube_url: 'https://youtube.com/watch?v=U3Zvz_p5cV0',
        thumbnail_url: 'https://img.youtube.com/vi/U3Zvz_p5cV0/maxresdefault.jpg',
        category: 'technical',
        duration_minutes: 28
      },
      {
        id: 'tech-3',
        title: 'Data Structures & Algorithms Interview Questions',
        description: 'Master the fundamentals of data structures and algorithms for technical interviews. Learn about arrays, linked lists, trees, graphs, and common algorithms.',
        youtube_url: 'https://youtube.com/watch?v=8hly31xKli0',
        thumbnail_url: 'https://img.youtube.com/vi/8hly31xKli0/maxresdefault.jpg',
        category: 'technical',
        duration_minutes: 45
      },
      {
        id: 'tech-4',
        title: 'HTML & CSS Interview Questions',
        description: 'Essential HTML and CSS interview questions for frontend developers. Learn about semantic HTML, CSS layouts, responsive design, and modern CSS features.',
        youtube_url: 'https://youtube.com/watch?v=W6NZfCO5SIk',
        thumbnail_url: 'https://img.youtube.com/vi/W6NZfCO5SIk/maxresdefault.jpg',
        category: 'technical',
        duration_minutes: 25
      },
      {
        id: 'tech-5',
        title: 'JavaScript Interview Questions & Answers',
        description: 'Common JavaScript interview questions and detailed answers. Perfect for frontend and full-stack developer interviews covering ES6, closures, promises, and more.',
        youtube_url: 'https://youtube.com/watch?v=W6NZfCO5SIk',
        thumbnail_url: 'https://img.youtube.com/vi/W6NZfCO5SIk/maxresdefault.jpg',
        category: 'technical',
        duration_minutes: 30
      },
      {
        id: 'tech-6',
        title: 'System Design Interview Guide - Complete Tutorial',
        description: 'Complete guide to system design interviews. Learn how to design scalable systems and answer system design questions effectively.',
        youtube_url: 'https://youtube.com/watch?v=quLkqoM9JYA',
        thumbnail_url: 'https://img.youtube.com/vi/quLkqoM9JYA/maxresdefault.jpg',
        category: 'technical',
        duration_minutes: 60
      },
      {
        id: 'tech-7',
        title: 'React.js Interview Questions & Answers',
        description: 'Top React.js interview questions for frontend developers. Covering React hooks, components, state management, and best practices.',
        youtube_url: 'https://youtube.com/watch?v=W6NZfCO5SIk',
        thumbnail_url: 'https://img.youtube.com/vi/W6NZfCO5SIk/maxresdefault.jpg',
        category: 'technical',
        duration_minutes: 32
      },
      {
        id: 'tech-8',
        title: 'Database & SQL Interview Questions',
        description: 'Essential database and SQL interview questions. Learn about database design, SQL queries, indexing, and database optimization.',
        youtube_url: 'https://youtube.com/watch?v=W6NZfCO5SIk',
        thumbnail_url: 'https://img.youtube.com/vi/W6NZfCO5SIk/maxresdefault.jpg',
        category: 'technical',
        duration_minutes: 40
      }
    ],
    hr: [
      {
        id: 'hr-1',
        title: 'Tell Me About Yourself - Perfect Answer Template',
        description: 'How to craft the perfect answer to "Tell me about yourself" question. Professional self-introduction techniques and best practices.',
        youtube_url: 'https://youtube.com/watch?v=1eiAqhYf6Ao',
        thumbnail_url: 'https://img.youtube.com/vi/1eiAqhYf6Ao/maxresdefault.jpg',
        category: 'hr',
        duration_minutes: 15
      },
      {
        id: 'hr-2',
        title: 'HR Interview Questions & Best Answers',
        description: 'Most common HR interview questions and how to answer them professionally. Learn the best responses to behavioral questions.',
        youtube_url: 'https://youtube.com/watch?v=GocdYwKJjqg',
        thumbnail_url: 'https://img.youtube.com/vi/GocdYwKJjqg/maxresdefault.jpg',
        category: 'hr',
        duration_minutes: 25
      },
      {
        id: 'hr-3',
        title: 'Behavioral Interview Strategies - STAR Method',
        description: 'STAR method and behavioral interview techniques. How to structure your answers for maximum impact and showcase your skills.',
        youtube_url: 'https://youtube.com/watch?v=75vq7XwDwE4',
        thumbnail_url: 'https://img.youtube.com/vi/75vq7XwDwE4/maxresdefault.jpg',
        category: 'hr',
        duration_minutes: 35
      },
      {
        id: 'hr-4',
        title: 'How to Answer "Why Should We Hire You?"',
        description: 'Professional strategies for answering "Why should we hire you?" question. Stand out from other candidates with compelling answers.',
        youtube_url: 'https://youtube.com/watch?v=wzrGsn_JwdA',
        thumbnail_url: 'https://img.youtube.com/vi/wzrGsn_JwdA/maxresdefault.jpg',
        category: 'hr',
        duration_minutes: 18
      },
      {
        id: 'hr-5',
        title: 'Salary Negotiation Tips for Job Interviews',
        description: 'How to negotiate salary during job interviews. Professional salary negotiation strategies and techniques to get the best offer.',
        youtube_url: 'https://youtube.com/watch?v=H6n3iNh4XLI',
        thumbnail_url: 'https://img.youtube.com/vi/H6n3iNh4XLI/maxresdefault.jpg',
        category: 'hr',
        duration_minutes: 20
      },
      {
        id: 'hr-6',
        title: 'How to Answer "What Are Your Weaknesses?"',
        description: 'Professional strategies for answering the weakness question. Turn your weaknesses into strengths and show self-awareness.',
        youtube_url: 'https://youtube.com/watch?v=1eiAqhYf6Ao',
        thumbnail_url: 'https://img.youtube.com/vi/1eiAqhYf6Ao/maxresdefault.jpg',
        category: 'hr',
        duration_minutes: 12
      },
      {
        id: 'hr-7',
        title: 'Leadership & Teamwork Interview Questions',
        description: 'Common leadership and teamwork interview questions. Learn how to showcase your leadership skills and team collaboration experience.',
        youtube_url: 'https://youtube.com/watch?v=GocdYwKJjqg',
        thumbnail_url: 'https://img.youtube.com/vi/GocdYwKJjqg/maxresdefault.jpg',
        category: 'hr',
        duration_minutes: 22
      },
      {
        id: 'hr-8',
        title: 'How to Handle Stress & Pressure Questions',
        description: 'Professional strategies for answering stress and pressure-related questions. Show your ability to handle challenging situations.',
        youtube_url: 'https://youtube.com/watch?v=75vq7XwDwE4',
        thumbnail_url: 'https://img.youtube.com/vi/75vq7XwDwE4/maxresdefault.jpg',
        category: 'hr',
        duration_minutes: 16
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
      // Search through all available videos (both from database and static)
      const allVideos = [
        ...videos,
        ...staticVideos.technical,
        ...staticVideos.hr
      ];

      const query = searchQuery.toLowerCase();
      
      // Filter videos based on search query
      const searchResults = allVideos.filter(video => {
        const titleMatch = video.title.toLowerCase().includes(query);
        const descriptionMatch = video.description.toLowerCase().includes(query);
        const categoryMatch = video.category.toLowerCase().includes(query);
        
        return titleMatch || descriptionMatch || categoryMatch;
      });

      // Convert to search result format
      const formattedResults = searchResults.map(video => ({
        id: video.id,
        title: video.title,
        description: video.description,
        thumbnail: video.thumbnail_url,
        duration: formatDuration(video.duration_minutes),
        url: video.youtube_url,
        category: video.category
      }));
      
      setSearchResults(formattedResults);
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
              Video Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Search for videos (e.g., 'JavaScript', 'HR questions', 'system design', 'behavioral')"
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
                <h3 className="font-semibold mb-4">Search Results ({searchResults.length} videos found)</h3>
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
                            <div className="flex items-center gap-2 mb-1">
                              <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground capitalize">
                                {result.category}
                              </span>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {result.duration}
                              </div>
                            </div>
                            <h4 className="font-medium text-sm leading-tight mb-1">{result.title}</h4>
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{result.description}</p>
                            <Button size="sm" variant="outline" asChild className="w-full">
                              <a href={result.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-3 h-3 mr-1" />
                                Watch Video
                              </a>
                            </Button>
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