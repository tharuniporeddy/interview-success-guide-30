import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Play, ExternalLink, Search, RefreshCw, AlertCircle } from "lucide-react";

interface VideoSearchProps {
  company: string;
  role: string;
}

interface VideoResult {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  url: string;
}

const VideoSearch = ({ company, role }: VideoSearchProps) => {
  const [videos, setVideos] = useState<VideoResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    searchVideos();
  }, [company, role]);

  const searchVideos = async (customQuery?: string) => {
    setLoading(true);
    setError(false);
    
    try {
      // Simulate API search - in real app this would call YouTube API or web search
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const query = customQuery || `${company} ${role} interview preparation`;
      
      // Mock successful results
      const mockVideos: VideoResult[] = [
        {
          id: '1',
          title: `${company} Interview Prep – DSA & System Design`,
          description: `Complete guide for ${company} ${role.toLowerCase()} interviews covering data structures, algorithms, and system design concepts.`,
          thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
          duration: '45:30',
          url: 'https://youtube.com/watch?v=dQw4w9WgXcQ'
        },
        {
          id: '2', 
          title: `Top 10 ${company} ${role} Interview Questions Answered!`,
          description: `Most commonly asked questions in ${company} ${role.toLowerCase()} interviews with detailed explanations and examples.`,
          thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
          duration: '28:15',
          url: 'https://youtube.com/watch?v=dQw4w9WgXcQ'
        }
      ];

      // Randomly simulate no results sometimes
      if (Math.random() > 0.8) {
        setVideos([]);
        setError(true);
      } else {
        setVideos(mockVideos);
      }
    } catch (err) {
      setError(true);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = () => {
    if (searchQuery.trim()) {
      searchVideos(searchQuery);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          📺 Video Tutorials for {company} - {role}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">🔍 Searching YouTube for relevant tutorials...</p>
          </div>
        ) : error || videos.length === 0 ? (
          <div className="text-center py-8 space-y-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <p className="font-medium">Oops! We couldn't find videos for this query right now.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try refreshing or searching manually ⤵️
              </p>
            </div>
            
            <div className="flex gap-2 max-w-md mx-auto">
              <Input
                placeholder="Search for interview videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()}
              />
              <Button onClick={handleManualSearch} size="sm">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            <Button onClick={() => searchVideos()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              🔎 Search YouTube Again
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">✅ Top Picks:</p>
            
            <div className="space-y-3">
              {videos.map((video, index) => (
                <Card key={video.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img 
                        src={video.thumbnail} 
                        alt={video.title}
                        className="w-32 h-20 object-cover rounded"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-sm leading-tight">
                            {index + 1}. "{video.title}"
                          </h4>
                          <Badge variant="outline" className="text-xs shrink-0">
                            {video.duration}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {video.description}
                        </p>
                        <Button size="sm" variant="outline" asChild>
                          <a href={video.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Watch on YouTube
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
  );
};

export default VideoSearch;