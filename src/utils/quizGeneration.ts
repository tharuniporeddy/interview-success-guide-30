import { supabase } from "@/integrations/supabase/client";

export interface QuizQuestion {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  difficulty: string;
}

// HR Questions - General behavioral and situational questions (15 questions)
const hrQuestions: QuizQuestion[] = [
  {
    id: "hr-1",
    question: "Tell me about a time when you had to work with a difficult team member. How did you handle the situation?",
    option_a: "I avoided working with them whenever possible",
    option_b: "I communicated directly about the issues and found common ground",
    option_c: "I complained to my manager immediately",
    option_d: "I did all the work myself to avoid conflict",
    correct_answer: "B",
    difficulty: "medium"
  },
  {
    id: "hr-2", 
    question: "How do you prioritize your tasks when you have multiple deadlines?",
    option_a: "I work on tasks in the order they were assigned",
    option_b: "I assess urgency and importance, then create a strategic plan",
    option_c: "I always work on the easiest tasks first",
    option_d: "I ask my manager to prioritize everything for me",
    correct_answer: "B",
    difficulty: "easy"
  },
  {
    id: "hr-3",
    question: "Describe a situation where you had to learn a new skill quickly.",
    option_a: "I waited for formal training to be provided",
    option_b: "I researched, practiced, and sought mentorship to learn efficiently",
    option_c: "I pretended to know the skill until I figured it out",
    option_d: "I delegated the task to someone else",
    correct_answer: "B", 
    difficulty: "medium"
  },
  {
    id: "hr-4",
    question: "How do you handle criticism from your supervisor?",
    option_a: "I take it personally and get defensive",
    option_b: "I listen actively, ask clarifying questions, and use it for improvement",
    option_c: "I ignore it and continue with my approach",
    option_d: "I immediately agree without understanding the feedback",
    correct_answer: "B",
    difficulty: "easy"
  },
  {
    id: "hr-5",
    question: "What motivates you to perform well at work?",
    option_a: "Only money and benefits",
    option_b: "Professional growth, meaningful work, and team collaboration",
    option_c: "Fear of getting fired",
    option_d: "Competition with colleagues",
    correct_answer: "B",
    difficulty: "easy"
  },
  {
    id: "hr-6",
    question: "Tell me about a time you failed at something. How did you handle it?",
    option_a: "I blamed external circumstances and moved on",
    option_b: "I analyzed what went wrong, learned from it, and applied lessons to future work",
    option_c: "I avoided taking risks after that",
    option_d: "I never failed at anything",
    correct_answer: "B",
    difficulty: "medium"
  },
  {
    id: "hr-7",
    question: "How do you handle stress and pressure in the workplace?",
    option_a: "I get overwhelmed and shut down",
    option_b: "I break tasks into manageable parts and use stress management techniques",
    option_c: "I work longer hours until I burn out",
    option_d: "I avoid stressful situations completely",
    correct_answer: "B",
    difficulty: "medium"
  },
  {
    id: "hr-8",
    question: "Describe your ideal work environment.",
    option_a: "One where I work alone without any interaction",
    option_b: "Collaborative, supportive, with opportunities for growth and open communication",
    option_c: "Highly competitive with individual recognition only",
    option_d: "One with minimal responsibilities and expectations",
    correct_answer: "B",
    difficulty: "easy"
  },
  {
    id: "hr-9",
    question: "How do you approach working with people from different backgrounds?",
    option_a: "I stick to working with people similar to me",
    option_b: "I embrace diversity, learn from different perspectives, and adapt my communication style",
    option_c: "I ignore cultural differences completely",
    option_d: "I assume everyone should adapt to my way of working",
    correct_answer: "B",
    difficulty: "medium"
  },
  {
    id: "hr-10",
    question: "Tell me about a time you had to meet a challenging deadline.",
    option_a: "I missed the deadline and blamed others",
    option_b: "I organized my time, sought help when needed, and delivered quality work on time",
    option_c: "I submitted incomplete work to meet the deadline",
    option_d: "I asked for an extension without trying to meet the original deadline",
    correct_answer: "B",
    difficulty: "medium"
  },
  {
    id: "hr-11",
    question: "How do you handle conflicts in the workplace?",
    option_a: "I avoid all conflicts and hope they resolve themselves",
    option_b: "I address conflicts professionally, listen to all sides, and work toward solutions",
    option_c: "I always escalate conflicts to management immediately",
    option_d: "I take sides based on personal relationships",
    correct_answer: "B",
    difficulty: "medium"
  },
  {
    id: "hr-12",
    question: "What are your long-term career goals?",
    option_a: "I haven't thought about it",
    option_b: "I want to grow professionally, develop leadership skills, and contribute meaningfully to the organization",
    option_c: "I just want to do the minimum required work",
    option_d: "I want to quickly move to a management position regardless of my experience",
    correct_answer: "B",
    difficulty: "easy"
  },
  {
    id: "hr-13",
    question: "How do you stay updated with industry trends and developments?",
    option_a: "I don't bother staying updated",
    option_b: "I read industry publications, attend conferences, and network with professionals",
    option_c: "I only learn what's required for my current job",
    option_d: "I rely on my colleagues to inform me about changes",
    correct_answer: "B",
    difficulty: "medium"
  },
  {
    id: "hr-14",
    question: "Describe a time when you had to work under minimal supervision.",
    option_a: "I struggled because I need constant guidance",
    option_b: "I took initiative, set clear goals, and maintained regular communication with stakeholders",
    option_c: "I did whatever I thought was right without consulting anyone",
    option_d: "I avoided making any decisions on my own",
    correct_answer: "B",
    difficulty: "medium"
  },
  {
    id: "hr-15",
    question: "How do you contribute to a positive team environment?",
    option_a: "I focus only on my individual tasks",
    option_b: "I support colleagues, share knowledge, communicate openly, and celebrate team successes",
    option_c: "I compete with teammates to stand out",
    option_d: "I avoid participating in team activities",
    correct_answer: "B",
    difficulty: "easy"
  }
];

// Fallback question bank organized by company and role
const fallbackQuestions: Record<string, Record<string, QuizQuestion[]>> = {
  "Google": {
    "technical": [
      {
        id: "google-tech-1",
        question: "What is the time complexity of searching in a balanced binary search tree?",
        option_a: "O(n)",
        option_b: "O(log n)",
        option_c: "O(n log n)",
        option_d: "O(1)",
        correct_answer: "B",
        difficulty: "medium"
      },
      {
        id: "google-tech-2",
        question: "Which algorithm would you use to find the shortest path in a weighted graph?",
        option_a: "Breadth-First Search",
        option_b: "Depth-First Search",
        option_c: "Dijkstra's Algorithm",
        option_d: "Linear Search",
        correct_answer: "C",
        difficulty: "medium"
      },
      {
        id: "google-tech-3",
        question: "What is Google's primary programming language for Android development?",
        option_a: "Java",
        option_b: "Python",
        option_c: "Kotlin",
        option_d: "C++",
        correct_answer: "C",
        difficulty: "easy"
      },
      {
        id: "google-tech-4",
        question: "In MapReduce, what is the purpose of the 'reduce' function?",
        option_a: "To split data into chunks",
        option_b: "To aggregate intermediate results",
        option_c: "To sort the input data",
        option_d: "To validate data integrity",
        correct_answer: "B",
        difficulty: "hard"
      },
      {
        id: "google-tech-5",
        question: "What does 'Big O' notation describe?",
        option_a: "Memory usage",
        option_b: "Code readability",
        option_c: "Algorithm efficiency",
        option_d: "Number of bugs",
        correct_answer: "C",
        difficulty: "easy"
      },
      {
        id: "google-tech-6",
        question: "Which data structure is most suitable for implementing a cache with LRU eviction?",
        option_a: "Array",
        option_b: "Stack",
        option_c: "Hash Map + Doubly Linked List",
        option_d: "Binary Tree",
        correct_answer: "C",
        difficulty: "hard"
      },
      {
        id: "google-tech-7",
        question: "What is the main advantage of using microservices architecture?",
        option_a: "Easier debugging",
        option_b: "Better scalability and maintainability",
        option_c: "Faster development",
        option_d: "Lower costs",
        correct_answer: "B",
        difficulty: "medium"
      },
      {
        id: "google-tech-8",
        question: "In distributed systems, what is 'eventual consistency'?",
        option_a: "Data is always consistent",
        option_b: "Data becomes consistent over time",
        option_c: "Data is never consistent",
        option_d: "Consistency is not important",
        correct_answer: "B",
        difficulty: "hard"
      },
      {
        id: "google-tech-9",
        question: "What is the purpose of unit testing?",
        option_a: "Test the entire application",
        option_b: "Test individual components in isolation",
        option_c: "Test user interface only",
        option_d: "Test database connections",
        correct_answer: "B",
        difficulty: "easy"
      },
      {
        id: "google-tech-10",
        question: "Which design pattern is commonly used for creating objects without specifying their exact class?",
        option_a: "Singleton",
        option_b: "Observer",
        option_c: "Factory",
        option_d: "Decorator",
        correct_answer: "C",
        difficulty: "medium"
      }
    ],
    "hr": [
      {
        id: "google-hr-1",
        question: "What motivates you to work at Google?",
        option_a: "High salary only",
        option_b: "Innovation and impact on billions of users",
        option_c: "Easy work environment",
        option_d: "Job security only",
        correct_answer: "B",
        difficulty: "easy"
      },
      {
        id: "google-hr-2",
        question: "How would you handle a disagreement with a team member?",
        option_a: "Ignore the disagreement",
        option_b: "Escalate to manager immediately",
        option_c: "Discuss openly and find common ground",
        option_d: "Work around the person",
        correct_answer: "C",
        difficulty: "medium"
      },
      {
        id: "google-hr-3",
        question: "Describe a time when you failed and what you learned from it.",
        option_a: "I never fail",
        option_b: "Share specific example and lessons learned",
        option_c: "Blame others for the failure",
        option_d: "Avoid answering the question",
        correct_answer: "B",
        difficulty: "medium"
      },
      {
        id: "google-hr-4",
        question: "What is Google's mission statement?",
        option_a: "To make money",
        option_b: "To organize the world's information and make it universally accessible",
        option_c: "To be the biggest tech company",
        option_d: "To create the best products",
        correct_answer: "B",
        difficulty: "easy"
      },
      {
        id: "google-hr-5",
        question: "How do you prioritize tasks when everything seems urgent?",
        option_a: "Work on everything at once",
        option_b: "Ask manager to decide",
        option_c: "Evaluate impact and deadlines systematically",
        option_d: "Work on easiest tasks first",
        correct_answer: "C",
        difficulty: "medium"
      },
      {
        id: "google-hr-6",
        question: "What would you do if you noticed a colleague struggling with their work?",
        option_a: "Ignore it, not my problem",
        option_b: "Report them to manager",
        option_c: "Offer help and support",
        option_d: "Do their work for them",
        correct_answer: "C",
        difficulty: "easy"
      },
      {
        id: "google-hr-7",
        question: "How do you stay updated with industry trends?",
        option_a: "I don't need to",
        option_b: "Read blogs, attend conferences, continuous learning",
        option_c: "Only listen to colleagues",
        option_d: "Wait for company training",
        correct_answer: "B",
        difficulty: "easy"
      },
      {
        id: "google-hr-8",
        question: "Describe your ideal work environment.",
        option_a: "Working alone always",
        option_b: "Collaborative, innovative, and growth-oriented",
        option_c: "No challenges or pressure",
        option_d: "Minimum work required",
        correct_answer: "B",
        difficulty: "easy"
      },
      {
        id: "google-hr-9",
        question: "How would you contribute to Google's culture of innovation?",
        option_a: "Follow existing processes only",
        option_b: "Bring fresh ideas and encourage experimentation",
        option_c: "Avoid taking risks",
        option_d: "Focus only on assigned tasks",
        correct_answer: "B",
        difficulty: "medium"
      },
      {
        id: "google-hr-10",
        question: "What are your long-term career goals?",
        option_a: "Get promoted quickly",
        option_b: "Continuous learning and making meaningful impact",
        option_c: "Work less over time",
        option_d: "Change companies frequently",
        correct_answer: "B",
        difficulty: "easy"
      }
    ]
  }
};

// Add other companies with minimal questions that will be extended
["Amazon", "Microsoft", "Meta", "Apple", "Netflix", "Uber", "Airbnb", "Infosys", "TCS", "Wipro", "Accenture"].forEach(company => {
  fallbackQuestions[company] = {
    "technical": [
      {
        id: `${company.toLowerCase()}-tech-1`,
        question: `What interests you most about the technical challenges at ${company}?`,
        option_a: "The salary and benefits",
        option_b: "Working with cutting-edge technology and solving complex problems",
        option_c: "The office location",
        option_d: "Working hours flexibility",
        correct_answer: "B",
        difficulty: "easy"
      },
      {
        id: `${company.toLowerCase()}-tech-2`,
        question: `How would you approach a complex technical problem at ${company}?`,
        option_a: "Ask someone else to solve it",
        option_b: "Break it down, research, and collaborate with team",
        option_c: "Use only familiar solutions",
        option_d: "Avoid the problem",
        correct_answer: "B",
        difficulty: "medium"
      }
    ],
    "hr": [
      {
        id: `${company.toLowerCase()}-hr-1`,
        question: `What attracts you to work at ${company}?`,
        option_a: "High salary package",
        option_b: "Company culture, values, and growth opportunities",
        option_c: "Easy work environment",
        option_d: "Job security only",
        correct_answer: "B",
        difficulty: "easy"
      },
      {
        id: `${company.toLowerCase()}-hr-2`,
        question: `How do you handle tight deadlines at ${company}?`,
        option_a: "Panic and work overtime",
        option_b: "Prioritize tasks, communicate with team, and deliver quality work",
        option_c: "Compromise on quality",
        option_d: "Blame others for delays",
        correct_answer: "B",
        difficulty: "medium"
      }
    ]
  };
});

// Extend each company's question bank to ensure minimum 10 questions
Object.keys(fallbackQuestions).forEach(company => {
  Object.keys(fallbackQuestions[company]).forEach(role => {
    const currentQuestions = fallbackQuestions[company][role];
    let questionCounter = currentQuestions.length + 1;
    
    while (currentQuestions.length < 10) {
      // Add more generic questions to reach minimum 10
      const additionalQuestions = [
        {
          question: `Describe your experience with team collaboration in a ${role} role.`,
          option_a: "I prefer working alone",
          option_b: "I actively collaborate and communicate effectively",
          option_c: "I only collaborate when required",
          option_d: "I let others handle collaboration",
          correct_answer: "B",
          difficulty: "easy"
        },
        {
          question: `How do you stay updated with the latest ${role} trends and technologies?`,
          option_a: "I don't need to stay updated",
          option_b: "Continuous learning through courses, blogs, and practice",
          option_c: "Only through company training",
          option_d: "Learning from colleagues only",
          correct_answer: "B",
          difficulty: "easy"
        },
        {
          question: `What is your approach to handling criticism and feedback in a ${role} position?`,
          option_a: "Ignore negative feedback",
          option_b: "Accept constructively and use it for improvement",
          option_c: "Get defensive",
          option_d: "Blame others",
          correct_answer: "B",
          difficulty: "medium"
        },
        {
          question: `How would you contribute to ${company}'s success in a ${role} role?`,
          option_a: "Just complete assigned tasks",
          option_b: "Bring innovative ideas and drive results",
          option_c: "Follow existing processes only",
          option_d: "Focus on personal goals only",
          correct_answer: "B",
          difficulty: "medium"
        },
        {
          question: `What motivates you in a ${role} position?`,
          option_a: "Only financial rewards",
          option_b: "Learning, growth, and making meaningful impact",
          option_c: "Easy tasks",
          option_d: "Recognition only",
          correct_answer: "B",
          difficulty: "easy"
        },
        {
          question: `How do you handle stress and pressure in a ${role} environment?`,
          option_a: "Avoid stressful situations",
          option_b: "Use time management and stay focused on solutions",
          option_c: "Panic and lose focus",
          option_d: "Blame external factors",
          correct_answer: "B",
          difficulty: "medium"
        },
        {
          question: `Describe your problem-solving approach in a ${role} context.`,
          option_a: "Give up quickly",
          option_b: "Analyze systematically and seek creative solutions",
          option_c: "Use only familiar methods",
          option_d: "Ask others to solve problems",
          correct_answer: "B",
          difficulty: "medium"
        },
        {
          question: `What skills do you want to develop further in your ${role} career?`,
          option_a: "No additional skills needed",
          option_b: "Both technical and soft skills for career growth",
          option_c: "Only technical skills",
          option_d: "Only communication skills",
          correct_answer: "B",
          difficulty: "easy"
        }
      ];
      
      const questionIndex = (questionCounter - currentQuestions.length - 1) % additionalQuestions.length;
      const baseQuestion = additionalQuestions[questionIndex];
      
      currentQuestions.push({
        id: `${company.toLowerCase()}-${role}-${questionCounter}`,
        question: baseQuestion.question,
        option_a: baseQuestion.option_a,
        option_b: baseQuestion.option_b,
        option_c: baseQuestion.option_c,
        option_d: baseQuestion.option_d,
        correct_answer: baseQuestion.correct_answer,
        difficulty: baseQuestion.difficulty
      });
      
      questionCounter++;
    }
  });
});

export const generateQuizQuestions = async (
  company: string, 
  role: string, 
  categoryId?: string
): Promise<QuizQuestion[]> => {
  try {
    // First try AI generation
    const { data, error } = await supabase.functions.invoke('generate-quiz', {
      body: { 
        company: company || 'General',
        role: role || 'General',
        categoryId: categoryId
      }
    });

    if (!error && data?.questions && Array.isArray(data.questions) && data.questions.length >= 10) {
      // Ensure each AI question has an ID
      const questionsWithIds = data.questions.map((q: any, index: number) => ({
        ...q,
        id: q.id || `${company.toLowerCase()}-${role}-ai-${index + 1}`
      }));
      return questionsWithIds.slice(0, 15); // Return up to 15 questions
    }
    
    throw new Error('AI generation failed or insufficient questions');
  } catch (error) {
    console.warn('AI generation failed, using fallback questions:', error);
    
    // Use fallback questions
    const companyQuestions = fallbackQuestions[company] || fallbackQuestions["Google"];
    const roleQuestions = companyQuestions[role] || companyQuestions["technical"] || companyQuestions["hr"];
    
    // Ensure we have at least 10 questions
    const questions = [...roleQuestions];
    
    // If we still don't have enough, mix with other roles from same company
    if (questions.length < 10) {
      const otherRoles = Object.keys(companyQuestions).filter(r => r !== role);
      for (const otherRole of otherRoles) {
        if (questions.length >= 10) break;
        questions.push(...companyQuestions[otherRole].slice(0, 10 - questions.length));
      }
    }
    
    // Shuffle questions and return 10-15
    const shuffled = questions.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(15, Math.max(10, shuffled.length)));
  }
};