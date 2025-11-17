export interface Package {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  monthlyLabel: string;
}

export const PACKAGES: Package[] = [
  {
    id: "starter",
    name: "AI Starter Package",
    price: 30000,
    description:
      "Scalable, results-driven solutions designed to grow with your business.",
    monthlyLabel: "/month",
    features: [
      "20 AI-generated social media posts per month",
      "2 AI-optimized blog articles (800-1200 words each)",
      "AI-driven content calendar and scheduling",
      "Basic AI copywriting for ads and emails",
      "Campaign strategy development and setup",
      "AI-personalized email marketing (up to 1,000 subscribers)",
      "Rule-based chatbot for website (FAQ automation on 50 questions)",
      "Monthly AI-generated performance reports",
      "Monthly 2-hour AI strategy consultation",
      "Email support during business hours",
    ],
  },
  {
    id: "growth",
    name: "AI Growth Package",
    price: 75000,
    description:
      "Scalable, results-driven solutions designed to grow with your business.",
    monthlyLabel: "/month",
    features: [
      "50 AI-generated social media posts per month",
      "8 AI-optimized blog articles with SEO analysis",
      "Dynamic content personalization for different audience segments",
      "Comprehensive campaign strategy across Google, Facebook, LinkedIn",
      "Advanced audience modeling and targeting",
      "Automated bid optimization and budget allocation",
      "AI-personalized campaigns (up to 5,000 subscribers)",
      "Natural language processing chatbot capabilities",
      "Appointment booking and scheduling integrations",
      "E-commerce support and product recommendations",
      "Multi-language support (2 languages)",
      "Weekly strategy sessions with AI specialists",
    ],
  },
  {
    id: "enterprise",
    name: "AI Enterprise Package",
    price: 150000,
    description:
      "Scalable, results-driven solutions designed to grow with your business.",
    monthlyLabel: "/month",
    features: [
      "100+ AI-generated social media posts per month",
      "15 AI-optimized long-form content pieces with advanced SEO",
      "AI-powered customer journey optimization",
      "Advanced predictive analytics and forecasting",
      "Custom AI model training for your brand voice",
      "Integration with enterprise CRM and marketing automation",
      "Multi-language support (5+ languages)",
      "Dedicated account manager",
      "24/7 priority support with 1-hour response time",
      "Quarterly business reviews and strategy optimization",
    ],
  },
];
