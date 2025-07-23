import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock, Target, BarChart3 } from "lucide-react";

interface QuizProgressProps {
  onTakeAnotherQuiz: () => void;
  onViewReport: () => void;
}

const QuizProgress = ({ onTakeAnotherQuiz, onViewReport }: QuizProgressProps) => {
  // Mock data - in real app this would come from database/state
  const stats = {
    quizzesCompleted: 3,
    averageScore: 78,
    timeSpent: 42,
    lastCompany: "Google",
    lastRole: "Technical"
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          📈 Your Progress So Far
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-primary">{stats.quizzesCompleted}</div>
            <div className="text-sm text-muted-foreground">📝 Quizzes Completed</div>
          </div>
          
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-primary">{stats.averageScore}%</div>
            <div className="text-sm text-muted-foreground">🎯 Average Score</div>
          </div>
          
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-primary">{stats.timeSpent}m</div>
            <div className="text-sm text-muted-foreground">⏱️ Time Spent</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{stats.averageScore}%</span>
          </div>
          <Progress value={stats.averageScore} className="h-2" />
        </div>

        <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="font-medium text-green-800 dark:text-green-200">🔥 Keep going – you're doing great!</span>
          </div>
          <p className="text-sm text-green-700 dark:text-green-300">
            Last session: {stats.lastCompany} - {stats.lastRole}
          </p>
        </div>

        <div className="flex gap-3">
          <Button onClick={onViewReport} variant="outline" className="flex-1">
            <Target className="h-4 w-4 mr-2" />
            View Detailed Report
          </Button>
          <Button onClick={onTakeAnotherQuiz} className="flex-1">
            <Clock className="h-4 w-4 mr-2" />
            Take Another Quiz
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizProgress;