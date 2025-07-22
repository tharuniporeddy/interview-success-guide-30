import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, Trophy, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

const BottomNavigation = () => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: BookOpen, label: "Quiz", path: "/quiz" },
    { icon: Trophy, label: "Tips", path: "/tips" },
    { icon: Video, label: "Videos", path: "/videos" }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Button
                key={item.path}
                variant="ghost"
                size="sm"
                asChild
                className={`flex flex-col items-center gap-1 h-12 px-3 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Link to={item.path}>
                  <Icon className="h-4 w-4" />
                  <span className="text-xs">{item.label}</span>
                </Link>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomNavigation;