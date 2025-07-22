import { Link } from "react-router-dom";
import { BookOpen, Trophy, Video, Users, Mail, Home } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Navigation Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">Quick Navigation</h3>
            <div className="grid grid-cols-2 gap-2">
              <Link 
                to="/" 
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors p-2 rounded-md hover:bg-accent/50"
              >
                <Home className="h-4 w-4" />
                Home
              </Link>
              <Link 
                to="/quiz" 
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors p-2 rounded-md hover:bg-accent/50"
              >
                <BookOpen className="h-4 w-4" />
                Start Quiz
              </Link>
              <Link 
                to="/tips" 
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors p-2 rounded-md hover:bg-accent/50"
              >
                <Trophy className="h-4 w-4" />
                Tips
              </Link>
              <Link 
                to="/videos" 
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors p-2 rounded-md hover:bg-accent/50"
              >
                <Video className="h-4 w-4" />
                Videos
              </Link>
              <a 
                href="mailto:support@interviewhub.com" 
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors p-2 rounded-md hover:bg-accent/50"
              >
                <Mail className="h-4 w-4" />
                Contact
              </a>
            </div>
          </div>

          {/* Benefits */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">Why Choose Our Platform?</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-primary mt-2"></div>
                <span className="text-muted-foreground">Personalized interview preparation tailored to your career goals</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-accent mt-2"></div>
                <span className="text-muted-foreground">Role-wise and company-specific practice questions</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-secondary mt-2"></div>
                <span className="text-muted-foreground">Smart video suggestions powered by AI technology</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-orange-500 mt-2"></div>
                <span className="text-muted-foreground">Progress tracking & AI-powered mock interviews</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 text-center">
          <p className="text-muted-foreground text-sm">
            © 2024 Interview Preparation Hub. Built to help you succeed in your career journey.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;