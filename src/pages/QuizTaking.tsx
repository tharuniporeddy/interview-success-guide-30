import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Clock, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface QuizQuestion {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  difficulty: string;
}

interface QuizAnswer {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
}

const QuizTaking = () => {
  const { categoryId } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<QuizAnswer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [category, setCategory] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (categoryId) {
      fetchQuestions();
      fetchCategory();
    }
  }, [categoryId, user, loading]);

  const fetchCategory = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_categories')
        .select('*')
        .eq('id', categoryId)
        .single();

      if (error) throw error;
      setCategory(data);
    } catch (error) {
      console.error('Error fetching category:', error);
    }
  };

  const fetchQuestions = async () => {
    try {
      // First try to fetch from database
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('category_id', categoryId)
        .limit(10);

      if (error) throw error;
      
      // If no questions found in database, generate them dynamically
      if (!data || data.length === 0) {
        console.log('No questions found in database, generating with AI...');
        await generateQuestionsWithAI();
      } else {
        setQuestions(data);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      // Try to generate questions as fallback
      await generateQuestionsWithAI();
    } finally {
      setLoadingQuestions(false);
    }
  };

  const generateQuestionsWithAI = async () => {
    try {
      if (!category) {
        toast({
          title: "Error", 
          description: "Category information not available",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Generating Questions",
        description: "Creating personalized quiz questions using AI...",
      });

      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: { 
          company: category.company || 'General',
          role: category.role || category.type,
          categoryId: categoryId
        }
      });

      if (error) throw error;

      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        toast({
          title: "Success",
          description: `Generated ${data.questions.length} personalized questions!`,
        });
      } else {
        throw new Error('No questions generated');
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      toast({
        title: "Error",
        description: "Failed to generate quiz questions. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    if (!selectedAnswer) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;
    
    const newAnswer: QuizAnswer = {
      questionId: currentQuestion.id,
      userAnswer: selectedAnswer,
      isCorrect
    };

    const updatedAnswers = [...userAnswers, newAnswer];
    setUserAnswers(updatedAnswers);
    setSelectedAnswer("");

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      completeQuiz(updatedAnswers);
    }
  };

  const completeQuiz = async (answers: QuizAnswer[]) => {
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const finalScore = Math.round((correctAnswers / questions.length) * 100);
    const timeTaken = Math.round((Date.now() - startTime) / 1000);

    setScore(finalScore);
    setQuizCompleted(true);

    try {
      // Save quiz attempt
      const { data: attemptData, error: attemptError } = await supabase
        .from('quiz_attempts')
        .insert({
          user_id: user?.id,
          category_id: categoryId,
          score: finalScore,
          total_questions: questions.length,
          time_taken: timeTaken
        })
        .select()
        .single();

      if (attemptError) throw attemptError;

      // Save individual answers
      const answerInserts = answers.map(answer => ({
        attempt_id: attemptData.id,
        question_id: answer.questionId,
        user_answer: answer.userAnswer,
        is_correct: answer.isCorrect
      }));

      const { error: answersError } = await supabase
        .from('quiz_answers')
        .insert(answerInserts);

      if (answersError) throw answersError;

      toast({
        title: "Quiz Completed!",
        description: `You scored ${finalScore}% on this quiz.`,
      });
    } catch (error) {
      console.error('Error saving quiz results:', error);
      toast({
        title: "Error",
        description: "Failed to save quiz results",
        variant: "destructive",
      });
    }
  };

  if (loading || loadingQuestions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0 && !loadingQuestions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">
              Unable to load questions. This might be due to missing questions in the database or API limitations.
            </p>
            <div className="space-y-2">
              <Button onClick={() => window.location.reload()} className="w-full">
                Try Again
              </Button>
              <Button onClick={() => navigate('/quiz')} variant="outline" className="w-full">
                Back to Categories
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 flex items-center justify-center">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              {score >= 70 ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <XCircle className="h-8 w-8 text-orange-600" />
              )}
            </div>
            <CardTitle className="text-2xl">Quiz Completed!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">{score}%</div>
              <p className="text-muted-foreground">
                You answered {userAnswers.filter(a => a.isCorrect).length} out of {questions.length} questions correctly
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl font-semibold">{userAnswers.filter(a => a.isCorrect).length}</div>
                <p className="text-sm text-muted-foreground">Correct</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold">{userAnswers.filter(a => !a.isCorrect).length}</div>
                <p className="text-sm text-muted-foreground">Incorrect</p>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate('/quiz')} variant="outline">
                Back to Categories
              </Button>
              <Button onClick={() => navigate('/')}>
                Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/quiz')} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Exit Quiz
              </Button>
              <div>
                <h1 className="text-xl font-bold">{category?.name} Quiz</h1>
                <p className="text-sm text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="gap-1">
                <Clock className="h-3 w-3" />
                {currentQuestion.difficulty}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl leading-relaxed">
                {currentQuestion.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {['option_a', 'option_b', 'option_c', 'option_d'].map((optionKey, index) => {
                const optionValue = currentQuestion[optionKey as keyof QuizQuestion] as string;
                const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
                
                return (
                  <Button
                    key={optionKey}
                    variant={selectedAnswer === optionLetter ? "default" : "outline"}
                    className="w-full justify-start text-left h-auto p-4"
                    onClick={() => handleAnswerSelect(optionLetter)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                        {optionLetter}
                      </div>
                      <span className="flex-1">{optionValue}</span>
                    </div>
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-end">
            <Button 
              onClick={handleNextQuestion}
              disabled={!selectedAnswer}
              size="lg"
            >
              {currentQuestionIndex === questions.length - 1 ? 'Complete Quiz' : 'Next Question'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuizTaking;