import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Compass,
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Lightbulb,
  Target,
  TrendingUp,
  Brain,
} from "lucide-react";

interface CareerAnswer {
  questionId: number;
  answer: string;
}

interface CareerResult {
  suggestedMajor: string;
  majorAr: string;
  matchingSkills: string[];
  careerPaths: string[];
  description: string;
  descriptionAr: string;
}

const careerQuestions = [
  {
    id: 1,
    key: "subjects",
    options: [
      { value: "it", labelAr: "البرمجة والحاسوب", labelEn: "Programming & Computer Science" },
      { value: "engineering", labelAr: "الهندسة والبناء", labelEn: "Engineering & Construction" },
      { value: "business", labelAr: "الأعمال والتجارة", labelEn: "Business & Commerce" },
      { value: "health", labelAr: "الصحة والطب", labelEn: "Health & Medicine" },
      { value: "arts", labelAr: "الفنون والتصميم", labelEn: "Arts & Design" },
      { value: "science", labelAr: "العلوم والبحث", labelEn: "Science & Research" },
      { value: "media", labelAr: "الإعلام والتواصل", labelEn: "Media & Communication" },
      { value: "education", labelAr: "التعليم والتدريب", labelEn: "Education & Training" },
    ],
  },
  {
    id: 2,
    key: "activities",
    options: [
      { value: "coding", labelAr: "كتابة الأكواد والبرمجة", labelEn: "Writing code and programming" },
      { value: "design", labelAr: "رسم وتصميم المشاريع", labelEn: "Drawing and designing projects" },
      { value: "leadership", labelAr: "القيادة وتنظيم الفعاليات", labelEn: "Leading and organizing events" },
      { value: "analysis", labelAr: "تحليل البيانات وحل المشكلات", labelEn: "Analyzing data and solving problems" },
      { value: "helping", labelAr: "مساعدة الآخرين والتطوع", labelEn: "Helping others and volunteering" },
      { value: "creative", labelAr: "الإبداع الفني والكتابة", labelEn: "Creative arts and writing" },
      { value: "technical", labelAr: "إصلاح الأجهزة والمعدات", labelEn: "Repairing equipment and machinery" },
      { value: "research", labelAr: "القراءة والبحث العلمي", labelEn: "Reading and scientific research" },
    ],
  },
  {
    id: 3,
    key: "skills",
    options: [
      { value: "logical", labelAr: "التفكير المنطقي والتحليلي", labelEn: "Logical and analytical thinking" },
      { value: "creative", labelAr: "الإبداع والخيال", labelEn: "Creativity and imagination" },
      { value: "communication", labelAr: "التواصل مع الآخرين", labelEn: "Communicating with others" },
      { value: "technical", labelAr: "العمل مع التقنيات والأجهزة", labelEn: "Working with technology and devices" },
      { value: "organization", labelAr: "التنظيم وإدارة الوقت", labelEn: "Organization and time management" },
      { value: "problem_solving", labelAr: "حل المشكلات بسرعة", labelEn: "Quick problem solving" },
      { value: "manual", labelAr: "العمل اليدوي والعملي", labelEn: "Manual and practical work" },
      { value: "leadership", labelAr: "القيادة واتخاذ القرارات", labelEn: "Leadership and decision making" },
    ],
  },
  {
    id: 4,
    key: "problems",
    options: [
      { value: "technical", labelAr: "مشاكل تقنية وبرمجية", labelEn: "Technical and software problems" },
      { value: "math", labelAr: "مسائل رياضية ومنطقية", labelEn: "Mathematical and logical problems" },
      { value: "people", labelAr: "مشاكل العلاقات والتواصل", labelEn: "Relationship and communication issues" },
      { value: "design", labelAr: "تصميم حلول جمالية", labelEn: "Designing aesthetic solutions" },
      { value: "efficiency", labelAr: "تحسين العمليات والكفاءة", labelEn: "Improving efficiency and processes" },
      { value: "scientific", labelAr: "أسئلة علمية وبحثية", labelEn: "Scientific and research questions" },
      { value: "business", labelAr: "تحديات الأعمال والتجارة", labelEn: "Business and trade challenges" },
      { value: "health", labelAr: "مشاكل صحية وعلاجية", labelEn: "Health and medical issues" },
    ],
  },
  {
    id: 5,
    key: "environment",
    options: [
      { value: "office", labelAr: "مكتب个工作环境", labelEn: "Office environment" },
      { value: "lab", labelAr: "مختبر بحثي", labelEn: "Research laboratory" },
      { value: "field", labelAr: "موقع عمل ميداني", labelEn: "Field work location" },
      { value: "creative_space", labelAr: "مساحة إبداعية", labelEn: "Creative space" },
      { value: "remote", labelAr: "عمل عن بُعد", labelEn: "Remote work" },
      { value: "team", labelAr: "عمل ضمن فريق", labelEn: "Team environment" },
      { value: "independent", labelAr: "عمل مستقل", labelEn: "Independent work" },
      { value: "customer_facing", labelAr: "التعامل مع العملاء", labelEn: "Customer facing" },
    ],
  },
  {
    id: 6,
    key: "goals",
    options: [
      { value: "innovation", labelAr: "ابتكار تقنيات جديدة", labelEn: "Innovating new technologies" },
      { value: "leadership", labelAr: "قيادة فرق ومنظمات", labelEn: "Leading teams and organizations" },
      { value: "expertise", labelAr: "أن يكون خبير في مجاله", labelEn: "Becoming an expert in their field" },
      { value: "impact", labelAr: "إحداث تأثير إيجابي", labelEn: "Making a positive impact" },
      { value: "stability", labelAr: "استقرار مالي ووظيفي", labelEn: "Financial and job stability" },
      { value: "flexibility", labelAr: "مرونة في العمل", labelEn: "Work flexibility" },
      { value: "recognition", labelAr: "شهرة واعتراف", labelEn: "Fame and recognition" },
      { value: "helping", labelAr: "مساعدة الآخرين", labelEn: "Helping others" },
    ],
  },
  {
    id: 7,
    key: "tools",
    options: [
      { value: "computers", labelAr: "الحاسوب والبرمجيات", labelEn: "Computers and software" },
      { value: "tools", labelAr: "الأدوات والمعدات", labelEn: "Tools and equipment" },
      { value: "numbers", labelAr: "الأرقام والتحليل", labelEn: "Numbers and analysis" },
      { value: "words", labelAr: "الكلمات والتواصل", labelEn: "Words and communication" },
      { value: "images", labelAr: "الصور والرسومات", labelEn: "Images and graphics" },
      { value: "science", labelAr: "العلوم والتجارب", labelEn: "Science and experiments" },
      { value: "people", labelAr: "التعامل مع الناس", labelEn: "Working with people" },
      { value: "business", labelAr: "الأعمال والاستثمار", labelEn: "Business and investment" },
    ],
  },
  {
    id: 8,
    key: "work_style",
    options: [
      { value: "structured", labelAr: "عمل منظم حسب خطط", labelEn: "Structured work following plans" },
      { value: "flexible", labelAr: "عمل مرن بدون روتين", labelEn: "Flexible work without routine" },
      { value: "fast", labelAr: "عمل سريع ومتغير", labelEn: "Fast-paced and changing work" },
      { value: "detailed", labelAr: "عمل يتطلب دقة", labelEn: "Detail-oriented work" },
      { value: "collaborative", labelAr: "عمل جماعي تعاوني", labelEn: "Collaborative team work" },
      { value: "independent", labelAr: "عمل فردي مستقل", labelEn: "Independent individual work" },
      { value: "creative", labelAr: "عمل يتطلب إبداع", labelEn: "Creative work required" },
      { value: "service", labelAr: "عمل في خدمة الآخرين", labelEn: "Service-oriented work" },
    ],
  },
];

const majorsDatabase: Record<string, CareerResult> = {
  it: {
    suggestedMajor: "Information Technology",
    majorAr: "تكنولوجيا المعلومات",
    matchingSkills: ["Programming", "Problem Solving", "Logical Thinking", "Technical Skills"],
    careerPaths: ["Software Developer", "Web Developer", "Mobile App Developer", "System Administrator", "Cybersecurity Specialist", "Data Analyst"],
    description: "Information Technology is ideal for those who love technology, programming, and solving technical problems. The field offers diverse career opportunities with competitive salaries.",
    descriptionAr: "تكنولوجيا المعلومات مثالي لمن يحب التقنية والبرمجة وحل المشكلات التقنية. يوفر المجال فرص وظيفية متنوعة برواتب تنافسية.",
  },
  engineering: {
    suggestedMajor: "Engineering",
    majorAr: "الهندسة",
    matchingSkills: ["Problem Solving", "Mathematics", "Technical Skills", "Analytical Thinking"],
    careerPaths: ["Civil Engineer", "Mechanical Engineer", "Electrical Engineer", "Industrial Engineer", "Architect", "Project Manager"],
    description: "Engineering is perfect for those who enjoy applying science and mathematics to solve real-world problems and build infrastructure.",
    descriptionAr: "الهندسة مثالية لمن يستمتع بتطبيق العلوم والرياضيات لحل مشاكل العالم الحقيقي وبناء البنية التحتية.",
  },
  business: {
    suggestedMajor: "Business Administration",
    majorAr: "إدارة الأعمال",
    matchingSkills: ["Communication", "Leadership", "Organization", "Analytical Thinking"],
    careerPaths: ["Business Manager", "Marketing Specialist", "Financial Analyst", "HR Manager", "Entrepreneur", "Consultant"],
    description: "Business Administration suits those who enjoy leadership, communication, and working with numbers to drive organizational success.",
    descriptionAr: "إدارة الأعمال مناسبة لمن يستمتع بالقيادة والتواصل والعمل مع الأرقام لدفع نجاح المنظمات.",
  },
  health: {
    suggestedMajor: "Health Sciences",
    majorAr: "العلوم الصحية",
    matchingSkills: ["Helping Others", "Scientific Knowledge", "Attention to Detail", "Compassion"],
    careerPaths: ["Physician", "Nurse", "Pharmacist", "Physical Therapist", "Medical Technician", "Health Administrator"],
    description: "Health Sciences is ideal for those passionate about helping others and making a positive impact on people's lives.",
    descriptionAr: "العلوم الصحية مثالية لمن شغوف بمساعدة الآخرين وإحداث تأثير إيجابي على حياة الناس.",
  },
  arts: {
    suggestedMajor: "Arts & Design",
    majorAr: "الفنون والتصميم",
    matchingSkills: ["Creativity", "Visual Thinking", "Artistic Skills", "Imagination"],
    careerPaths: ["Graphic Designer", "UI/UX Designer", "Interior Designer", "Multimedia Artist", "Animation Specialist", "Brand Designer"],
    description: "Arts & Design is perfect for creative individuals who want to express themselves through visual communication.",
    descriptionAr: "الفنون والتصميم مثالي للأفراد المبدعين الذين يريدون التعبير عن أنفسهم من خلال الاتصال البصري.",
  },
  science: {
    suggestedMajor: "Computer Science",
    majorAr: "علوم الحاسب",
    matchingSkills: ["Logical Thinking", "Problem Solving", "Research", "Mathematics"],
    careerPaths: ["Software Engineer", "Data Scientist", "AI Researcher", "Machine Learning Engineer", "Algorithm Developer", "Research Scientist"],
    description: "Computer Science suits those who love algorithms, data, and building intelligent systems.",
    descriptionAr: "علوم الحاسب مناسبة لمن يحب الخوارزميات والبيانات وبناء الأنظمة الذكية.",
  },
  media: {
    suggestedMajor: "Media & Communication",
    majorAr: "الإعلام والتواصل",
    matchingSkills: ["Communication", "Creativity", "Writing", "Social Skills"],
    careerPaths: ["Content Creator", "Journalist", "Social Media Manager", "Marketing Coordinator", "PR Specialist", "Broadcast Producer"],
    description: "Media & Communication is ideal for those who enjoy storytelling, content creation, and influencing audiences.",
    descriptionAr: "الإعلام والتواصل مثالي لمن يستمتع بسرد القصص وإنشاء المحتوى والتأثير على الجماهير.",
  },
  education: {
    suggestedMajor: "Education & Training",
    majorAr: "التعليم والتدريب",
    matchingSkills: ["Communication", "Patience", "Helping Others", "Presentation Skills"],
    careerPaths: ["Teacher", "Trainer", "Educational Administrator", "Curriculum Developer", "Instructional Designer", "Education Consultant"],
    description: "Education is perfect for those who love sharing knowledge and helping others learn and grow.",
    descriptionAr: "التعليم مثالي لمن يحب مشاركة المعرفة ومساعدة الآخرين على التعلم والنمو.",
  },
};

export default function CareerGuidancePage() {
  const { t, lang, isRtl } = useI18n();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<CareerAnswer[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<CareerResult | null>(null);

  const analyzeMutation = useMutation({
    mutationFn: async (answers: CareerAnswer[]) => {
      const response = await apiRequest("POST", "/api/career/analyze", { answers });
      return response;
    },
    onSuccess: (data: any) => {
      setResult(data);
      setShowResult(true);
    },
    onError: () => {
      // Fallback to local analysis
      const localResult = analyzeAnswersLocally(answers);
      setResult(localResult);
      setShowResult(true);
    },
  });

  const analyzeAnswersLocally = (answers: CareerAnswer[]): CareerResult => {
    const answerValues = answers.map((a) => a.answer);
    
    // Count scores for each major category
    const scores: Record<string, number> = {
      it: 0,
      engineering: 0,
      business: 0,
      health: 0,
      arts: 0,
      science: 0,
      media: 0,
      education: 0,
    };

    answers.forEach((answer) => {
      switch (answer.answer) {
        case "it":
        case "coding":
        case "technical":
        case "computers":
          scores.it += 2;
          break;
        case "engineering":
        case "design":
        case "math":
        case "tools":
          scores.engineering += 2;
          break;
        case "business":
        case "leadership":
        case "efficiency":
        case "business":
        case "numbers":
          scores.business += 2;
          break;
        case "health":
        case "helping":
        case "scientific":
        case "service":
        case "health":
          scores.health += 2;
          break;
        case "arts":
        case "creative":
        case "images":
        case "creative_space":
          scores.arts += 2;
          break;
        case "science":
        case "analysis":
        case "research":
        case "lab":
          scores.science += 2;
          break;
        case "media":
        case "words":
        case "communication":
        case "customer_facing":
          scores.media += 2;
          break;
        case "education":
        case "people":
        case "helping":
        case "teaching":
          scores.education += 2;
          break;
      }
    });

    // Find the highest score
    let maxScore = 0;
    let suggestedMajor = "it";
    Object.entries(scores).forEach(([major, score]) => {
      if (score > maxScore) {
        maxScore = score;
        suggestedMajor = major;
      }
    });

    return majorsDatabase[suggestedMajor] || majorsDatabase.it;
  };

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers];
    const existingIndex = newAnswers.findIndex((a) => a.questionId === currentQuestion + 1);
    if (existingIndex >= 0) {
      newAnswers[existingIndex] = { questionId: currentQuestion + 1, answer: value };
    } else {
      newAnswers.push({ questionId: currentQuestion + 1, answer: value });
    }
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < careerQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      analyzeMutation.mutate(answers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResult(false);
    setResult(null);
  };

  const currentAnswer = answers.find((a) => a.questionId === currentQuestion + 1)?.answer || "";
  const progress = ((currentQuestion + 1) / careerQuestions.length) * 100;

  if (analyzeMutation.isPending) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto" dir={isRtl ? "rtl" : "ltr"}>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Brain className="h-12 w-12 text-primary animate-pulse mb-4" />
            <p className="text-lg font-medium">{t("ai.analyzing")}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {lang === "ar" ? "جارٍ تحليل إجاباتك..." : "Analyzing your answers..."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResult && result) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto" dir={isRtl ? "rtl" : "ltr"}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              {t("career.results")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-6 bg-primary/5 rounded-lg">
              <GraduationCap className="h-16 w-16 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold mb-2">
                {lang === "ar" ? result.majorAr : result.suggestedMajor}
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                {lang === "ar" ? result.descriptionAr : result.description}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                {t("career.matchingSkills")}
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.matchingSkills.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Target className="h-4 w-4" />
                {t("career.careerPaths")}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {result.careerPaths.map((path, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    {path}
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={handleRestart} className="w-full">
              {lang === "ar" ? "إعادة التقييم" : "Retake Assessment"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto" dir={isRtl ? "rtl" : "ltr"}>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
            <Compass className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{t("career.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("career.subtitle")}</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {t("career.question")} {currentQuestion + 1} {t("career.of")} {careerQuestions.length}
            </span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={currentAnswer}
            onValueChange={handleAnswer}
            className="space-y-3"
          >
            {careerQuestions[currentQuestion].options.map((option) => (
              <div
                key={option.value}
                className={`flex items-center space-x-2 rtl:space-x-reverse p-3 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50 ${
                  currentAnswer === option.value ? "border-primary bg-primary/5" : ""
                }`}
              >
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="flex-1 cursor-pointer font-normal">
                  {lang === "ar" ? option.labelAr : option.labelEn}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex justify-between mt-6 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              <span className="ms-2">{t("career.previous")}</span>
            </Button>
            <Button onClick={handleNext} disabled={!currentAnswer}>
              <span>
                {currentQuestion === careerQuestions.length - 1
                  ? t("career.start")
                  : t("career.next")}
              </span>
              {currentQuestion < careerQuestions.length - 1 && (
                <ArrowRight className="h-4 w-4 rtl:rotate-180 rtl:ms-2 ms-2" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

