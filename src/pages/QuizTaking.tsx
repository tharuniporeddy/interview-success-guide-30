import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Clock, CheckCircle, XCircle, BookOpen, Sparkles } from "lucide-react";
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
  const location = useLocation();
  const { toast } = useToast();
  
  // Get passed state from navigation
  const routeState = location.state as { company?: string; role?: string; categoryName?: string } | null;

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
      // Import the utility function
      const { generateQuizQuestions } = await import('@/utils/quizGeneration');
      
      let role = 'general';
      
      // Extract role from route state or categoryId
      if (routeState?.role) {
        role = routeState.role;
      } else if (categoryId) {
        // Parse from categoryId format: "role-round"
        if (categoryId.includes('technical')) {
          role = 'technical';
        } else if (categoryId.includes('hr')) {
          role = 'hr';
        }
      }

      toast({
        title: "Generating Questions",
        description: `Creating ${role} round questions...`,
      });

      const generatedQuestions = await generateQuizQuestions('General', role, categoryId);
      
      if (generatedQuestions && generatedQuestions.length >= 10) {
        setQuestions(generatedQuestions);
        toast({
          title: "Success",
          description: `Generated ${generatedQuestions.length} questions for ${role} round!`,
        });
      } else {
        throw new Error('Insufficient questions generated');
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      toast({
        title: "Error",
        description: "Failed to generate quiz questions. Please try again.",
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
    const correctAnswers = userAnswers.filter(a => a.isCorrect);
    const incorrectAnswers = userAnswers.filter(a => !a.isCorrect);
    
    // Generate improvement suggestions based on wrong answers
    const getImprovementSuggestions = () => {
      const role = routeState?.role || 'general';
      const wrongCount = incorrectAnswers.length;
      
      if (role === 'technical') {
        const suggestions = [];
        if (wrongCount > 0) {
          suggestions.push("💻 Review programming fundamentals and practice coding problems");
          suggestions.push("📊 Strengthen your understanding of data structures and algorithms");
          suggestions.push("🗄️ Study database concepts and SQL queries");
          suggestions.push("🔧 Brush up on object-oriented programming principles");
        }
        if (score < 60) {
          suggestions.push("📚 Consider taking online courses on computer science topics");
          suggestions.push("🛠️ Practice more hands-on coding exercises");
        }
        return suggestions.slice(0, 3);
      } else if (role === 'hr') {
        const suggestions = [];
        if (wrongCount > 0) {
          suggestions.push("💭 Practice articulating your experiences using the STAR method");
          suggestions.push("🤝 Work on communication and interpersonal skills");
          suggestions.push("🎯 Research common behavioral interview questions");
          suggestions.push("🏆 Prepare specific examples of leadership and teamwork");
        }
        if (score < 60) {
          suggestions.push("📖 Read about effective workplace communication");
          suggestions.push("🎪 Practice mock interviews with friends or mentors");
        }
        return suggestions.slice(0, 3);
      }
      return ["📈 Continue practicing to improve your interview skills"];
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                {score >= 70 ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : (
                  <XCircle className="h-8 w-8 text-orange-600" />
                )}
              </div>
              <CardTitle className="text-3xl">Quiz Completed!</CardTitle>
              <p className="text-muted-foreground">
                {routeState?.categoryName || 'Quiz'} Results
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-2">{score}%</div>
                <p className="text-lg text-muted-foreground">
                  You answered {correctAnswers.length} out of {questions.length} questions correctly
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-green-600">{correctAnswers.length}</div>
                  <p className="text-sm text-muted-foreground">Correct</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-red-600">{incorrectAnswers.length}</div>
                  <p className="text-sm text-muted-foreground">Incorrect</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-blue-600">{score >= 70 ? 'Pass' : 'Review'}</div>
                  <p className="text-sm text-muted-foreground">Status</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Results */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Question Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Question Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                {userAnswers.map((answer, index) => {
                  const question = questions.find(q => q.id === answer.questionId);
                  if (!question) return null;
                  
                  return (
                    <div key={answer.questionId} className={`p-3 rounded-lg border ${
                      answer.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          answer.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium line-clamp-2">{question.question}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs">
                            <span>Your answer: <strong>{answer.userAnswer}</strong></span>
                            {!answer.isCorrect && (
                              <span className="text-green-600">Correct: <strong>{question.correct_answer}</strong></span>
                            )}
                          </div>
                        </div>
                        {answer.isCorrect ? (
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Improvement Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Improvement Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {score >= 90 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">🎉</div>
                    <h3 className="text-lg font-semibold text-green-600 mb-2">Excellent Performance!</h3>
                    <p className="text-muted-foreground">You're well-prepared for this type of interview. Keep up the great work!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-muted-foreground mb-4">
                      Based on your performance, here are some areas to focus on:
                    </p>
                    {getImprovementSuggestions().map((suggestion, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700">
                          {index + 1}
                        </div>
                        <p className="text-sm text-blue-800">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    💡 <strong>Tip:</strong> Regular practice and reviewing your mistakes will help you improve significantly.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate('/quiz')} variant="outline" size="lg">
              Take Another Quiz
            </Button>
            <Button onClick={() => navigate('/')} size="lg">
              Back to Home
            </Button>
          </div>
        </div>
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
              <h1 className="text-xl font-bold">
                {routeState?.categoryName || category?.name || `${routeState?.company || 'General'} ${routeState?.role || 'Quiz'}`}
              </h1>
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