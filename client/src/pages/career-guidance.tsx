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
  BookOpen,
  Users,
  Zap,
  Award,
  Rocket,
  Briefcase,
  ChevronRight,
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
  whyThisMajor: string;
  whyThisMajorAr: string;
  howToPrepare: string[];
  howToPrepareAr: string[];
  relatedMajors: string[];
  relatedMajorsAr: string[];
  skillsToDevelop: string[];
  skillsToDevelopAr: string[];
}

interface MajorData {
  suggestedMajor: string;
  majorAr: string;
  matchingSkills: string[];
  careerPaths: string[];
  description: string;
  descriptionAr: string;
  whyThisMajor: string;
  whyThisMajorAr: string;
  howToPrepare: string[];
  howToPrepareAr: string[];
  relatedMajors: string[];
  relatedMajorsAr: string[];
  skillsToDevelop: string[];
  skillsToDevelopAr: string[];
}

const careerQuestions = [
  {
    id: 1,
    key: "subjects",
    questionAr: "ما هي المادة أو المواد التي تستمتع بدراستها أكثر من غيرها؟",
    questionEn: "Which subject do you enjoy studying the most?",
    options: [
      { value: "it", labelAr: "البرمجة والحاسوب", labelEn: "Programming & Computer Science" },
      { value: "engineering", labelAr: "الهندسة والبناء", labelEn: "Engineering & Construction" },
      { value: "business", labelAr: "الأعمال والتجارة", labelEn: "Business & Commerce" },
      { value: "health", labelAr: "الصحة والطب", labelEn: "Health & Medicine" },
      { value: "arts", labelAr: "الفنون والتصميم", labelEn: "Arts & Design" },
      { value: "science", labelAr: "العلوم والبحث", labelEn: "Science & Research" },
      { value: "media", labelAr: "الإعلام والتواصل", labelEn: "Media & Communication" },
      { value: "education", labelAr: "التعليم والتدريب", labelEn: "Education & Training" },
      { value: "law", labelAr: "القانون والسياسة", labelEn: "Law & Politics" },
      { value: "agriculture", labelAr: "الزراعة والغذاء", labelEn: "Agriculture & Food" },
    ],
  },
  {
    id: 2,
    key: "activities",
    questionAr: "ما النشاط الذي تستمتع به في وقت فراغك؟",
    questionEn: "What activity do you enjoy in your free time?",
    options: [
      { value: "coding", labelAr: "كتابة الأكواد والبرمجة", labelEn: "Writing code and programming" },
      { value: "design", labelAr: "رسم وتصميم المشاريع", labelEn: "Drawing and designing projects" },
      { value: "leadership", labelAr: "القيادة وتنظيم الفعاليات", labelEn: "Leading and organizing events" },
      { value: "analysis", labelAr: "تحليل البيانات وحل المشكلات", labelEn: "Analyzing data and solving problems" },
      { value: "helping", labelAr: "مساعدة الآخرين والتطوع", labelEn: "Helping others and volunteering" },
      { value: "creative", labelAr: "الإبداع الفني والكتابة", labelEn: "Creative arts and writing" },
      { value: "technical", labelAr: "إصلاح الأجهزة والمعدات", labelEn: "Repairing equipment and machinery" },
      { value: "research", labelAr: "القراءة والبحث العلمي", labelEn: "Reading and scientific research" },
      { value: "sports", labelAr: "الرياضة والعناية الصحية", labelEn: "Sports and health care" },
      { value: "social", labelAr: "التواصل الاجتماعي والمناسبات", labelEn: "Socializing and events" },
    ],
  },
  {
    id: 3,
    key: "skills",
    questionAr: "ما المهارة التي تعتمد عليها في حل المشكلات؟",
    questionEn: "Which skill do you consider yourself strong in?",
    options: [
      { value: "logical", labelAr: "التفكير المنطقي والتحليلي", labelEn: "Logical and analytical thinking" },
      { value: "creative", labelAr: "الإبداع والخيال", labelEn: "Creativity and imagination" },
      { value: "communication", labelAr: "التواصل مع الآخرين", labelEn: "Communicating with others" },
      { value: "technical", labelAr: "العمل مع التقنيات والأجهزة", labelEn: "Working with technology and devices" },
      { value: "organization", labelAr: "التنظيم وإدارة الوقت", labelEn: "Organization and time management" },
      { value: "problem_solving", labelAr: "حل المشكلات بسرعة", labelEn: "Quick problem solving" },
      { value: "manual", labelAr: "العمل اليدوي والعملي", labelEn: "Manual and practical work" },
      { value: "leadership", labelAr: "القيادة واتخاذ القرارات", labelEn: "Leadership and decision making" },
      { value: "scientific", labelAr: "البحث والتجريب", labelEn: "Research and experimentation" },
      { value: "empathy", labelAr: "التعاطف وفهم الآخرين", labelEn: "Empathy and understanding others" },
    ],
  },
  {
    id: 4,
    key: "problems",
    questionAr: "ما نوع المشكلات التي تحب حلها؟",
    questionEn: "What type of problems do you like solving?",
    options: [
      { value: "technical", labelAr: "مشاكل تقنية وبرمجية", labelEn: "Technical and software problems" },
      { value: "math", labelAr: "مسائل رياضية ومنطقية", labelEn: "Mathematical and logical problems" },
      { value: "people", labelAr: "مشاكل العلاقات والتواصل", labelEn: "Relationship and communication issues" },
      { value: "design", labelAr: "تصميم حلول جمالية", labelEn: "Designing aesthetic solutions" },
      { value: "efficiency", labelAr: "تحسين العمليات والكفاءة", labelEn: "Improving efficiency and processes" },
      { value: "scientific", labelAr: "أسئلة علمية وبحثية", labelEn: "Scientific and research questions" },
      { value: "business", labelAr: "تحديات الأعمال والتجارة", labelEn: "Business and trade challenges" },
      { value: "health", labelAr: "مشاكل صحية وعلاجية", labelEn: "Health and medical issues" },
      { value: "legal", labelAr: "قانونية وعقدية", labelEn: "Legal and contractual issues" },
      { value: "environmental", labelAr: "بيئية وزراعية", labelEn: "Environmental and agricultural" },
    ],
  },
  {
    id: 5,
    key: "environment",
    questionAr: "في أي بيئة عمل تشعر بالراحة؟",
    questionEn: "In which work environment do you feel comfortable?",
    options: [
      { value: "office", labelAr: "مكتب", labelEn: "Office environment" },
      { value: "lab", labelAr: "مختبر بحثي", labelEn: "Research laboratory" },
      { value: "field", labelAr: "موقع عمل ميداني", labelEn: "Field work location" },
      { value: "creative_space", labelAr: "مساحة إبداعية", labelEn: "Creative space" },
      { value: "remote", labelAr: "عمل عن بُعد", labelEn: "Remote work" },
      { value: "team", labelAr: "عمل ضمن فريق", labelEn: "Team environment" },
      { value: "independent", labelAr: "عمل مستقل", labelEn: "Independent work" },
      { value: "customer_facing", labelAr: "التعامل مع العملاء", labelEn: "Customer facing" },
      { value: "hospital", labelAr: "مستشفى أو عيادة", labelEn: "Hospital or clinic" },
      { value: "court", labelAr: "محكمة أو مكتب قانوني", labelEn: "Court or law office" },
    ],
  },
  {
    id: 6,
    key: "goals",
    questionAr: "ما هو هدفك المهني الأهم؟",
    questionEn: "What is your most important career goal?",
    options: [
      { value: "innovation", labelAr: "ابتكار تقنيات جديدة", labelEn: "Innovating new technologies" },
      { value: "leadership", labelAr: "قيادة فرق ومنظمات", labelEn: "Leading teams and organizations" },
      { value: "expertise", labelAr: "أن يكون خبير في مجاله", labelEn: "Becoming an expert in their field" },
      { value: "impact", labelAr: "إحداث تأثير إيجابي", labelEn: "Making a positive impact" },
      { value: "stability", labelAr: "استقرار مالي ووظيفي", labelEn: "Financial and job stability" },
      { value: "flexibility", labelAr: "مرونة في العمل", labelEn: "Work flexibility" },
      { value: "recognition", labelAr: "شهرة واعتراف", labelEn: "Fame and recognition" },
      { value: "helping", labelAr: "مساعدة الآخرين", labelEn: "Helping others" },
      { value: "justice", labelAr: "تحقيق العدالة", labelEn: "Achieving justice" },
      { value: "sustainability", labelAr: "الحفاظ على البيئة", labelEn: "Environmental sustainability" },
    ],
  },
  {
    id: 7,
    key: "tools",
    questionAr: "ما الأداة التي تفضل العمل بها؟",
    questionEn: "Which tool do you prefer working with?",
    options: [
      { value: "computers", labelAr: "الحاسوب والبرمجيات", labelEn: "Computers and software" },
      { value: "tools", labelAr: "الأدوات والمعدات", labelEn: "Tools and equipment" },
      { value: "numbers", labelAr: "الأرقام والتحليل", labelEn: "Numbers and analysis" },
      { value: "words", labelAr: "الكلمات والتواصل", labelEn: "Words and communication" },
      { value: "images", labelAr: "الصور والرسومات", labelEn: "Images and graphics" },
      { value: "science", labelAr: "العلوم والتجارب", labelEn: "Science and experiments" },
      { value: "people", labelAr: "التعامل مع الناس", labelEn: "Working with people" },
      { value: "business", labelAr: "الأعمال والاستثمار", labelEn: "Business and investment" },
      { value: "nature", labelAr: "الطبيعة والنباتات", labelEn: "Nature and plants" },
      { value: "documents", labelAr: "المستندات والعقود", labelEn: "Documents and contracts" },
    ],
  },
  {
    id: 8,
    key: "work_style",
    questionAr: "ما هو أسلوب عملك المفضل؟",
    questionEn: "What is your preferred work style?",
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
  {
    id: 9,
    key: "values",
    questionAr: "ما القيمة التي تهمك أكثر في عملك؟",
    questionEn: "What value matters most to you in your work?",
    options: [
      { value: "innovation", labelAr: "الابتكار والإبداع", labelEn: "Innovation and creativity" },
      { value: "money", labelAr: "الراتب والمكافآت", labelEn: "Salary and rewards" },
      { value: "helping", labelAr: "مساعدة الناس", labelEn: "Helping people" },
      { value: "recognition", labelAr: "التقدير والاحترام", labelEn: "Recognition and respect" },
      { value: "growth", labelAr: "التعلم والنمو", labelEn: "Learning and growth" },
      { value: "balance", labelAr: "توازن العمل والحياة", labelEn: "Work-life balance" },
      { value: "impact", labelAr: "التأثير المجتمعي", labelEn: "Social impact" },
      { value: "authority", labelAr: "السلطة والنفوذ", labelEn: "Authority and influence" },
    ],
  },
  {
    id: 10,
    key: "future",
    questionAr: "كيف تتخيل نفسك بعد 10 سنوات؟",
    questionEn: "How do you imagine yourself in 10 years?",
    options: [
      { value: "tech_leader", labelAr: "قائد في شركة تقنية", labelEn: "Leader in a tech company" },
      { value: "entrepreneur", labelAr: "رجل أعمال ناجح", labelEn: "Successful entrepreneur" },
      { value: "expert", labelAr: "خبير معترف به", labelEn: "Recognized expert" },
      { value: "doctor", labelAr: "طبيب أو متخصص صحي", labelEn: "Doctor or health specialist" },
      { value: "designer", labelAr: "مصمم معروف", labelEn: "Famous designer" },
      { value: "researcher", labelAr: "باحث في مختبر", labelEn: "Researcher in a lab" },
      { value: "educator", labelAr: "معلم أو مدرب", labelEn: "Teacher or trainer" },
      { value: "leader", labelAr: "قائد في مجاله", labelEn: "Leader in their field" },
    ],
  },
];

const majorsDatabase: Record<string, MajorData> = {
  it: {
    suggestedMajor: "Information Technology",
    majorAr: "تكنولوجيا المعلومات",
    matchingSkills: ["Programming", "Problem Solving", "Logical Thinking", "Technical Skills"],
    careerPaths: ["Software Developer", "Web Developer", "Mobile App Developer", "System Administrator", "Cybersecurity Specialist", "Data Analyst", "AI/ML Engineer", "DevOps Engineer"],
    description: "Information Technology is ideal for those who love technology, programming, and solving technical problems. The field offers diverse career opportunities with competitive salaries.",
    descriptionAr: "تكنولوجيا المعلومات مثالي لمن يحب التقنية والبرمجة وحل المشكلات التقنية. يوفر المجال فرص وظيفية متنوعة برواتب تنافسية.",
    whyThisMajor: "You have strong logical thinking and technical skills. The IT field is constantly growing and offers many opportunities for innovation and career growth.",
    whyThisMajorAr: "لديك تفكير منطقي قوي ومهارات تقنية. مجال تكنولوجيا المعلومات ينمو باستمرار ويوفر العديد من فرص الابتكار والنمو المهني.",
    howToPrepare: [
      "Start learning programming languages like Python or JavaScript",
      "Build projects and create a portfolio",
      "Join coding communities and participate in hackathons",
      "Learn about databases and cloud computing",
      "Get certifications like CompTIA or AWS",
    ],
    howToPrepareAr: [
      "ابدأ بتعلم لغات البرمجة مثل بايثون أو جافاسكريبت",
      "ابنِ مشاريع وأنشئ معرض أعمال خاص بك",
      "انضم لمجتمعات البرمجة وشارك في هاكاثونات",
      "تعلم عن قواعد البيانات والحوسبة السحابية",
      "احصل على شهادات مثل CompTIA أو AWS",
    ],
    relatedMajors: ["Computer Science", "Software Engineering", "Data Science", "Cybersecurity"],
    relatedMajorsAr: ["علوم الحاسب", "هندسة البرمجيات", "علم البيانات", "الأمن السيبراني"],
    skillsToDevelop: ["Programming", "Problem Solving", "Teamwork", "Communication", "Continuous Learning"],
    skillsToDevelopAr: ["البرمجة", "حل المشكلات", "العمل الجماعي", "التواصل", "التعلم المستمر"],
  },
  engineering: {
    suggestedMajor: "Engineering",
    majorAr: "الهندسة",
    matchingSkills: ["Problem Solving", "Mathematics", "Technical Skills", "Analytical Thinking"],
    careerPaths: ["Civil Engineer", "Mechanical Engineer", "Electrical Engineer", "Industrial Engineer", "Architect", "Project Manager", "Aerospace Engineer", "Chemical Engineer"],
    description: "Engineering is perfect for those who enjoy applying science and mathematics to solve real-world problems and build infrastructure.",
    descriptionAr: "الهندسة مثالية لمن يستمتع بتطبيق العلوم والرياضيات لحل مشاكل العالم الحقيقي وبناء البنية التحتية.",
    whyThisMajor: "Your analytical thinking and love for technical problem-solving make engineering an excellent choice. Engineers are in high demand globally.",
    whyThisMajorAr: "تفكيرك التحليلي وحبك لحل المشكلات التقنية يجعل الهندسة خيارًا ممتازًا. المهندسون مطلوبون عالميًا.",
    howToPrepare: [
      "Strengthen mathematics and physics foundation",
      "Take part in science fairs and engineering competitions",
      "Learn CAD software and design tools",
      "Seek internships at engineering firms",
      "Join engineering clubs and societies",
    ],
    howToPrepareAr: [
      "قوِ أساسيات الرياضيات والفيزياء",
      "شارك في معارض العلوم ومسابقات الهندسة",
      "تعلم برامج CAD وأدوات التصميم",
      "ابحث عن تدريب في شركات هندسية",
      "انضم للأندية والمجتمعات الهندسية",
    ],
    relatedMajors: ["Computer Engineering", "Mechanical Engineering", "Electrical Engineering", "Civil Engineering"],
    relatedMajorsAr: ["هندسة الحاسب", "الهندسة الميكانيكية", "الهندسة الكهربائية", "الهندسة المدنية"],
    skillsToDevelop: ["Mathematics", "Physics", "Problem Solving", "Project Management", "Technical Drawing"],
    skillsToDevelopAr: ["الرياضيات", "الفيزياء", "حل المشكلات", "إدارة المشاريع", "الرسم التقني"],
  },
  business: {
    suggestedMajor: "Business Administration",
    majorAr: "إدارة الأعمال",
    matchingSkills: ["Communication", "Leadership", "Organization", "Analytical Thinking"],
    careerPaths: ["Business Manager", "Marketing Specialist", "Financial Analyst", "HR Manager", "Entrepreneur", "Consultant", "Project Manager", "Operations Manager"],
    description: "Business Administration suits those who enjoy leadership, communication, and working with numbers to drive organizational success.",
    descriptionAr: "إدارة الأعمال مناسبة لمن يستمتع بالقيادة والتواصل والعمل مع الأرقام لدفع نجاح المنظمات.",
    whyThisMajor: "Your leadership skills and ability to work with people make business administration a great fit. The business world offers diverse career paths.",
    whyThisMajorAr: "مهاراتك القيادية وقدرتك على العمل مع الناس تجعل إدارة الأعمال خيارًا رائعًا. عالم الأعمال يوفر مسارات مهنية متنوعة.",
    howToPrepare: [
      "Start a small business or project",
      "Join student organizations and take leadership roles",
      "Learn about financial markets and investment",
      "Take online business courses",
      "Read business books and case studies",
    ],
    howToPrepareAr: [
      "ابدأ مشروعًا صغيرًا أو عملاً",
      "انضم للمنظمات الطلابية وتولى مناصب قيادية",
      "تعلم عن الأسواق المالية والاستثمار",
      "خذ دورات أعمال عبر الإنترنت",
      "اقرأ كتب الأعمال ودراسات الحالة",
    ],
    relatedMajors: ["Finance", "Marketing", "Accounting", "Economics"],
    relatedMajorsAr: ["المالية", "التسويق", "المحاسبة", "الاقتصاد"],
    skillsToDevelop: ["Leadership", "Communication", "Financial Analysis", "Strategic Thinking", "Negotiation"],
    skillsToDevelopAr: ["القيادة", "التواصل", "التحليل المالي", "التفكير الاستراتيجي", "التفاوض"],
  },
  health: {
    suggestedMajor: "Health Sciences",
    majorAr: "العلوم الصحية",
    matchingSkills: ["Helping Others", "Scientific Knowledge", "Attention to Detail", "Compassion"],
    careerPaths: ["Physician", "Nurse", "Pharmacist", "Physical Therapist", "Medical Technician", "Health Administrator", "Dentist", "Veterinarian"],
    description: "Health Sciences is ideal for those passionate about helping others and making a positive impact on people's lives.",
    descriptionAr: "العلوم الصحية مثالية لمن شغوف بمساعدة الآخرين وإحداث تأثير إيجابي على حياة الناس.",
    whyThisMajor: "Your desire to help others and your scientific mindset make health sciences an excellent career choice with high demand and job security.",
    whyThisMajorAr: "رغبتك في مساعدة الآخرين وعقلك العلمي يجعل العلوم الصحية خيارًا مهنيًا ممتازًا مع طلب عالٍ وأمان وظيفي.",
    howToPrepare: [
      "Volunteer at hospitals or healthcare facilities",
      "Take biology and chemistry courses",
      "Shadow healthcare professionals",
      "Join health-related clubs",
      "Maintain a high GPA in science subjects",
    ],
    howToPrepareAr: [
      "تطوع في المستوصفات أو المرافق الصحية",
      "خذ دورات في الأحياء والكيمياء",
      "راقب المهنيين الصحيين",
      "انضم للأندية الصحية",
      "حافظ على معدل عالٍ في المواد العلمية",
    ],
    relatedMajors: ["Medicine", "Nursing", "Pharmacy", "Dentistry", "Physical Therapy"],
    relatedMajorsAr: ["الطب", "التمريض", "الصيدلة", "طب الأسنان", "العلاج الطبيعي"],
    skillsToDevelop: ["Scientific Knowledge", "Compassion", "Attention to Detail", "Communication", "Critical Thinking"],
    skillsToDevelopAr: ["المعرفة العلمية", "التعاطف", "الانتباه للتفاصيل", "التواصل", "التفكير الناقد"],
  },
  arts: {
    suggestedMajor: "Arts & Design",
    majorAr: "الفنون والتصميم",
    matchingSkills: ["Creativity", "Visual Thinking", "Artistic Skills", "Imagination"],
    careerPaths: ["Graphic Designer", "UI/UX Designer", "Interior Designer", "Multimedia Artist", "Animation Specialist", "Brand Designer", "Fashion Designer", "Product Designer"],
    description: "Arts & Design is perfect for creative individuals who want to express themselves through visual communication.",
    descriptionAr: "الفنون والتصميم مثالي للأفراد المبدعين الذين يريدون التعبير عن أنفسهم من خلال الاتصال البصري.",
    whyThisMajor: "Your creativity and visual thinking skills make arts and design a perfect fit. The creative industry is growing rapidly.",
    whyThisMajorAr: "إبداعك ومهارات التفكير البصري تجعل الفنون والتصميم خيارًا مثالياً. صناعة الإبداع تنمو بسرعة.",
    howToPrepare: [
      "Build a portfolio of your work",
      "Learn design software like Adobe Creative Suite",
      "Take art and design courses",
      "Participate in design competitions",
      "Seek internships at design agencies",
    ],
    howToPrepareAr: [
      "ابنِ معرض أعمال من أعمالك",
      "تعلم برامج التصميم مثل Adobe Creative Suite",
      "خذ دورات في الفنون والتصميم",
      "شارك في مسابقات التصميم",
      "ابحث عن تدريب في وكالات التصميم",
    ],
    relatedMajors: ["Graphic Design", "Interior Design", "Fashion Design", "Animation"],
    relatedMajorsAr: ["التصميم الجرافيكي", "التصميم الداخلي", "أزياء", "الرسوم المتحركة"],
    skillsToDevelop: ["Creativity", "Visual Communication", "Software Skills", "Time Management", "Client Communication"],
    skillsToDevelopAr: ["الإبداع", "التواصل البصري", "مهارات البرمجيات", "إدارة الوقت", "التواصل مع العملاء"],
  },
  science: {
    suggestedMajor: "Computer Science",
    majorAr: "علوم الحاسب",
    matchingSkills: ["Logical Thinking", "Problem Solving", "Research", "Mathematics"],
    careerPaths: ["Software Engineer", "Data Scientist", "AI Researcher", "Machine Learning Engineer", "Algorithm Developer", "Research Scientist", "Quantum Computing Specialist", "Robotics Engineer"],
    description: "Computer Science suits those who love algorithms, data, and building intelligent systems.",
    descriptionAr: "علوم الحاسب مناسبة لمن يحب الخوارزميات والبيانات وبناء الأنظمة الذكية.",
    whyThisMajor: "Your logical thinking and problem-solving abilities are perfect for computer science. AI and data science are the future.",
    whyThisMajorAr: "تفكيرك المنطقي وقدراتك في حل المشكلات مثالية لعلوم الحاسب. الذكاء الاصطناعي وعلم البيانات هو المستقبل.",
    howToPrepare: [
      "Learn programming fundamentals",
      "Study mathematics especially linear algebra and calculus",
      "Take online courses in AI and machine learning",
      "Participate in coding competitions",
      "Read research papers in your area of interest",
    ],
    howToPrepareAr: [
      "تعلم أساسيات البرمجة",
      "ادرس الرياضيات خاصة الجبر الخطي والتفاضل",
      "خذ دورات عبر الإنترنت في الذكاء الاصطناعي والتعلم الآلي",
      "شارك في مسابقات البرمجة",
      "اقرأ الأوراق البحثية في مجال اهتمامك",
    ],
    relatedMajors: ["Artificial Intelligence", "Data Science", "Computer Engineering", "Robotics"],
    relatedMajorsAr: ["الذكاء الاصطناعي", "علم البيانات", "هندسة الحاسب", "الروبوتات"],
    skillsToDevelop: ["Programming", "Mathematics", "Research", "Algorithm Design", "Machine Learning"],
    skillsToDevelopAr: ["البرمجة", "الرياضيات", "البحث", "تصميم الخوارزميات", "التعلم الآلي"],
  },
  media: {
    suggestedMajor: "Media & Communication",
    majorAr: "الإعلام والتواصل",
    matchingSkills: ["Communication", "Creativity", "Writing", "Social Skills"],
    careerPaths: ["Content Creator", "Journalist", "Social Media Manager", "Marketing Coordinator", "PR Specialist", "Broadcast Producer", "Digital Marketer", "Brand Manager"],
    description: "Media & Communication is ideal for those who enjoy storytelling, content creation, and influencing audiences.",
    descriptionAr: "الإعلام والتواصل مثالي لمن يستمتع بسرد القصص وإنشاء المحتوى والتأثير على الجماهير.",
    whyThisMajor: "Your communication skills and creativity make media and communication an excellent choice. Digital media is booming.",
    whyThisMajorAr: "مهاراتك في التواصل وإبداعك تجعل الإعلام والتواصل خيارًا ممتازاً. الإعلام الرقمي مزدهر.",
    howToPrepare: [
      "Start a blog or YouTube channel",
      "Create content for social media",
      "Join school newspaper or media club",
      "Learn about digital marketing",
      "Take courses in journalism and communication",
    ],
    howToPrepareAr: [
      "ابدأ مدونة أو قناة يوتيوب",
      "أنشئ محتوى لوسائل التواصل الاجتماعي",
      "انضم لصحيفة المدرسة أو نادٍ إعلامي",
      "تعلم عن التسويق الرقمي",
      "خذ دورات في الصحافة والتواصل",
    ],
    relatedMajors: ["Journalism", "Public Relations", "Digital Marketing", "Film Production"],
    relatedMajorsAr: ["الصحافة", "العلاقات العامة", "التسويق الرقمي", "إنتاج الأفلام"],
    skillsToDevelop: ["Writing", "Public Speaking", "Social Media", "Video Production", "Marketing"],
    skillsToDevelopAr: ["الكتابة", "التحدث أمام الجمهور", "وسائل التواصل الاجتماعي", "إنتاج الفيديو", "التسويق"],
  },
  education: {
    suggestedMajor: "Education & Training",
    majorAr: "التعليم والتدريب",
    matchingSkills: ["Communication", "Patience", "Helping Others", "Presentation Skills"],
    careerPaths: ["Teacher", "Trainer", "Educational Administrator", "Curriculum Developer", "Instructional Designer", "Education Consultant", "School Counselor", "Education Technology Specialist"],
    description: "Education is perfect for those who love sharing knowledge and helping others learn and grow.",
    descriptionAr: "التعليم مثالي لمن يحب مشاركة المعرفة ومساعدة الآخرين على التعلم والنمو.",
    whyThisMajor: "Your patience and desire to help others learn make education an ideal career. Educators are always in demand.",
    whyThisMajorAr: "صبرك ورغبتك في مساعدة الآخرين على التعلم تجعل التعليم مهنة مثالية. المعلمون مطلوبون دائمًا.",
    howToPrepare: [
      "Tutor younger students",
      "Volunteer at schools or educational centers",
      "Join teaching clubs and organizations",
      "Take psychology and pedagogy courses",
      "Develop presentation and public speaking skills",
    ],
    howToPrepareAr: [
      "درّب الطلاب الأصغر سناً",
      "تطوع في المدارس أو المراكز التعليمية",
      "انضم للأندية والمنظمات التعليمية",
      "خذ دورات في علم النفس التربوي",
      "طوّر مهارات العرض والتحدث أمام الجمهور",
    ],
    relatedMajors: ["Psychology", "Curriculum Design", "Educational Technology", "Special Education"],
    relatedMajorsAr: ["علم النفس", "تصميم المناهج", "التقنية التعليمية", "التعليم الخاص"],
    skillsToDevelop: ["Patience", "Communication", "Presentation", "Curriculum Design", "Mentoring"],
    skillsToDevelopAr: ["الصبر", "التواصل", "العرض", "تصميم المناهج", "التوجيه"],
  },
  law: {
    suggestedMajor: "Law",
    majorAr: "القانون",
    matchingSkills: ["Research", "Critical Thinking", "Communication", "Analytical Thinking"],
    careerPaths: ["Lawyer", "Judge", "Legal Consultant", "Corporate Counsel", "Legal Analyst", "Mediator", "Human Rights Advocate", "Public Prosecutor"],
    description: "Law is perfect for those who are passionate about justice, critical thinking, and advocacy.",
    descriptionAr: "القانون مثالي لمن شغوف بالعدالة والتفكير الناقد والدفاع عن الحقوق.",
    whyThisMajor: "Your analytical thinking and communication skills make law an excellent choice. Legal professionals are essential to society.",
    whyThisMajorAr: "تفكيرك التحليلي ومهارات التواصل تجعل القانون خيارًا ممتازاً. المهنيون القانونيون ضروريون للمجتمع.",
    howToPrepare: [
      "Join debate club to improve argumentation",
      "Read legal books and case studies",
      "Shadow lawyers or judges",
      "Take courses in logic and philosophy",
      "Volunteer for legal aid organizations",
    ],
    howToPrepareAr: [
      "انضم لنادي المناظرة لتحسين الحجج",
      "اقرأ الكتب القانونية ودراسات الحالة",
      "راقب المحامين أو القضاة",
      "خذ دورات في المنطق والفلسفة",
      "تطوع في منظمات المساعدة القانونية",
    ],
    relatedMajors: ["International Law", "Criminal Law", "Corporate Law", "Human Rights Law"],
    relatedMajorsAr: ["القانون الدولي", "القانون الجنائي", "قانون الشركات", "قانون حقوق الإنسان"],
    skillsToDevelop: ["Research", "Argumentation", "Writing", "Public Speaking", "Critical Analysis"],
    skillsToDevelopAr: ["البحث", "الحجج", "الكتابة", "التحدث أمام الجمهور", "التحليل النقدي"],
  },
  agriculture: {
    suggestedMajor: "Agriculture & Environmental Sciences",
    majorAr: "الزراعة والعلوم البيئية",
    matchingSkills: ["Nature", "Science", "Practical Work", "Sustainability"],
    careerPaths: ["Agricultural Engineer", "Environmental Scientist", "Food Scientist", "Forestry Specialist", "Water Resources Manager", "Sustainable Agriculture Expert", "Plant Scientist", "Animal Scientist"],
    description: "Agriculture & Environmental Sciences is ideal for those who love nature and want to contribute to sustainability.",
    descriptionAr: "الزراعة والعلوم البيئية مثالي لمن يحب الطبيعة ويريد المساهمة في الاستدامة.",
    whyThisMajor: "Your connection to nature and interest in sustainability make this field ideal. Food security is a growing global concern.",
    whyThisMajorAr: "ارتباطك بالطبيعة واهتمامك بالاستدامة يجعل هذا المجال مثالياً. الأمن الغذائي هو قلق عالمي متنامٍ.",
    howToPrepare: [
      "Join environmental clubs",
      "Volunteer at farms or gardens",
      "Take biology and chemistry courses",
      "Learn about sustainable practices",
      "Follow agricultural innovations",
    ],
    howToPrepareAr: [
      "انضم للأندية البيئية",
      "تطوع في مزارع أو حدائق",
      "خذ دورات في الأحياء والكيمياء",
      "تعلم عن الممارسات المستدامة",
      "تابع الابتكارات الزراعية",
    ],
    relatedMajors: ["Environmental Science", "Food Science", "Forestry", "Animal Science"],
    relatedMajorsAr: ["العلوم البيئية", "علم الغذاء", "الحرجية", "علم الحيوان"],
    skillsToDevelop: ["Scientific Research", "Sustainability", "Practical Skills", "Data Analysis", "Project Management"],
    skillsToDevelopAr: ["البحث العلمي", "الاستدامة", "المهارات العملية", "تحليل البيانات", "إدارة المشاريع"],
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
  const [showDetails, setShowDetails] = useState(false);

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
      const localResult = analyzeAnswersLocally(answers);
      setResult(localResult);
      setShowResult(true);
    },
  });

  const analyzeAnswersLocally = (answers: CareerAnswer[]): CareerResult => {
    const scores: Record<string, number> = {
      it: 0,
      engineering: 0,
      business: 0,
      health: 0,
      arts: 0,
      science: 0,
      media: 0,
      education: 0,
      law: 0,
      agriculture: 0,
    };

    const answerMap: Record<string, string[]> = {
      it: ["it", "coding", "technical", "computers", "logical", "problem_solving"],
      engineering: ["engineering", "design", "math", "tools", "technical", "problem_solving"],
      business: ["business", "leadership", "efficiency", "numbers", "organization", "money"],
      health: ["health", "helping", "scientific", "service", "hospital", "empathy"],
      arts: ["arts", "creative", "images", "design", "creative_space"],
      science: ["science", "analysis", "research", "lab", "scientific"],
      media: ["media", "words", "communication", "customer_facing", "social"],
      education: ["education", "people", "helping", "teaching", "patience"],
      law: ["law", "legal", "documents", "justice", "authority"],
      agriculture: ["agriculture", "nature", "environmental", "sustainability"],
    };

    answers.forEach((answer) => {
      const answerValue = answer.answer;
      for (const [major, keywords] of Object.entries(answerMap)) {
        if (keywords.some(k => answerValue.includes(k) || k.includes(answerValue))) {
          scores[major] += 1.5;
        }
      }
      
      // Additional scoring based on specific matches
      if (answerValue === "it" || answerValue === "coding" || answerValue === "computers" || answerValue === "technical") scores.it += 2;
      if (answerValue === "engineering" || answerValue === "design" || answerValue === "math") scores.engineering += 2;
      if (answerValue === "business" || answerValue === "leadership" || answerValue === "efficiency" || answerValue === "numbers") scores.business += 2;
      if (answerValue === "health" || answerValue === "helping" || answerValue === "hospital") scores.health += 2;
      if (answerValue === "arts" || answerValue === "creative" || answerValue === "images") scores.arts += 2;
      if (answerValue === "science" || answerValue === "analysis" || answerValue === "research" || answerValue === "lab") scores.science += 2;
      if (answerValue === "media" || answerValue === "words" || answerValue === "communication" || answerValue === "social") scores.media += 2;
      if (answerValue === "education" || answerValue === "people" || answerValue === "teaching" || answerValue === "patience") scores.education += 2;
      if (answerValue === "law" || answerValue === "legal" || answerValue === "documents" || answerValue === "justice") scores.law += 2;
      if (answerValue === "agriculture" || answerValue === "nature" || answerValue === "environmental" || answerValue === "sustainability") scores.agriculture += 2;
    });

    // Find top 3 majors
    const sortedMajors = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const suggestedMajor = sortedMajors[0][0];
    const secondaryMajor = sortedMajors[1][0];
    
    // Create result with primary major
    const baseResult = majorsDatabase[suggestedMajor] || majorsDatabase.it;
    
    // Add secondary major as related
    const secondaryData = majorsDatabase[secondaryMajor];
    const relatedMajors = secondaryData 
      ? [secondaryData.suggestedMajor, ...baseResult.relatedMajors.slice(0, 2)]
      : baseResult.relatedMajors;
    const relatedMajorsAr = secondaryData
      ? [secondaryData.majorAr, ...baseResult.relatedMajorsAr.slice(0, 2)]
      : baseResult.relatedMajorsAr;

    return {
      ...baseResult,
      relatedMajors,
      relatedMajorsAr,
    };
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
    setShowDetails(false);
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
              {lang === "ar" ? "جارٍ تحليل إجاباتك وتقديم التوصيات..." : "Analyzing your answers and providing recommendations..."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResult && result) {
    return (
      <div className="p-4 sm:p-6 max-w-3xl mx-auto" dir={isRtl ? "rtl" : "ltr"}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              {lang === "ar" ? "نتيجة التوجيه المهني" : "Career Guidance Result"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main Result */}
            <div className="text-center py-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
              <GraduationCap className="h-16 w-16 mx-auto mb-4 text-primary" />
              <h2 className="text-3xl font-bold mb-2">
                {lang === "ar" ? result.majorAr : result.suggestedMajor}
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                {lang === "ar" ? result.descriptionAr : result.description}
              </p>
            </div>

            {/* Why This Major */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-blue-500" />
                {lang === "ar" ? "لماذا هذا التخصص مناسب لك؟" : "Why This Major Fits You?"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {lang === "ar" ? result.whyThisMajorAr : result.whyThisMajor}
              </p>
            </div>

            {/* Skills */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                {lang === "ar" ? "المهارات المناسبة" : "Matching Skills"}
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.matchingSkills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Career Paths */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                {lang === "ar" ? "المسارات المهنية" : "Career Paths"}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {result.careerPaths.slice(0, 6).map((path, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm p-2 bg-muted/50 rounded">
                    <TrendingUp className="h-3 w-3 text-green-500 flex-shrink-0" />
                    <span>{path}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Related Majors */}
            {(result.relatedMajors?.length > 0) && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  {lang === "ar" ? "تخصصات مشابهة" : "Related Majors"}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(lang === "ar" ? result.relatedMajorsAr : result.relatedMajors).map((major, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {major}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Skills to Develop */}
            {(result.skillsToDevelop?.length > 0) && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Rocket className="h-4 w-4" />
                  {lang === "ar" ? "مهارات تحتاج تطويرها" : "Skills to Develop"}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(lang === "ar" ? result.skillsToDevelopAr : result.skillsToDevelop).map((skill, index) => (
                    <Badge key={index} variant="default" className="text-sm bg-orange-500">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* How to Prepare - Toggle */}
            <div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails 
                  ? (lang === "ar" ? "إخفاء النصائح" : "Hide Tips")
                  : (lang === "ar" ? "كيف تستعد لهذا المسار؟" : "How to Prepare for This Path?")
                }
                <ChevronRight className={`h-4 w-4 ms-2 transition-transform ${showDetails ? "rotate-90" : ""}`} />
              </Button>
              
              {showDetails && (
                <div className="mt-4 space-y-3">
                  {(lang === "ar" ? result.howToPrepareAr : result.howToPrepare).map((tip, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm font-medium">
                        {index + 1}
                      </div>
                      <p className="text-sm">{tip}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button onClick={handleRestart} className="w-full" size="lg">
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
            <p className="text-sm text-muted-foreground">
              {lang === "ar" ? "أجب على الأسئلة التالية لاكتشاف التخصص المناسب لك" : "Answer the following questions to discover your ideal major"
              }
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {lang === "ar" ? "السؤال" : "Question"} {currentQuestion + 1} {lang === "ar" ? "من" : "of"} {careerQuestions.length}
            </span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <h3 className="text-lg font-medium">
              {lang === "ar" 
                ? careerQuestions[currentQuestion].questionAr 
                : careerQuestions[currentQuestion].questionEn
              }
            </h3>
          </div>
          
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
              <span className="ms-2">{lang === "ar" ? "السابق" : "Previous"}</span>
            </Button>
            <Button onClick={handleNext} disabled={!currentAnswer}>
              <span>
                {currentQuestion === careerQuestions.length - 1
                  ? (lang === "ar" ? "احصل على النتيجة" : "Get Results")
                  : (lang === "ar" ? "التالي" : "Next")
                }
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
