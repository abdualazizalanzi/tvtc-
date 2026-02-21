import { useI18n } from "@/lib/i18n";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  FileCheck,
  Briefcase,
  TrendingUp,
  ChevronDown,
  Award,
  Users,
  Building2,
  Heart,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

export default function LandingPage() {
  const { t, lang, isRtl } = useI18n();
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <nav className="fixed top-0 inset-x-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-1 h-16">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary text-primary-foreground">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="font-bold text-lg" data-testid="text-app-name">
                {t("app.name")}
              </span>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <a href="#about" className="text-sm text-muted-foreground transition-colors" data-testid="link-about">
                {t("nav.about")}
              </a>
              <a href="#benefits" className="text-sm text-muted-foreground transition-colors" data-testid="link-benefits">
                {t("nav.benefits")}
              </a>
              <a href="#howto" className="text-sm text-muted-foreground transition-colors" data-testid="link-howto">
                {t("nav.howto")}
              </a>
            </div>

            <div className="flex items-center gap-1">
              <LanguageToggle />
              <ThemeToggle />
              <a href="/api/login">
                <Button data-testid="button-login">{t("nav.login")}</Button>
              </a>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 -start-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 -end-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge variant="secondary" className="text-sm px-4 py-1.5">
                <Award className="h-3.5 w-3.5" />
                <span className="ms-1.5">
                  {lang === "ar" ? "منصة معتمدة من الجامعة" : "University Certified Platform"}
                </span>
              </Badge>
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight font-serif"
                data-testid="text-hero-title"
              >
                {t("landing.hero.title")}
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-lg leading-relaxed">
                {t("landing.hero.subtitle")}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <a href="/api/login">
                  <Button size="lg" data-testid="button-cta">
                    {t("landing.hero.cta")}
                    <Arrow className="h-4 w-4 ms-2" />
                  </Button>
                </a>
                <a href="#about">
                  <Button variant="outline" size="lg" data-testid="button-learn-more">
                    {t("landing.hero.learnMore")}
                    <ChevronDown className="h-4 w-4 ms-2" />
                  </Button>
                </a>
              </div>
              <div className="flex flex-wrap items-center gap-4 pt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  {lang === "ar" ? "مجاني بالكامل" : "Completely Free"}
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  {lang === "ar" ? "سهل الاستخدام" : "Easy to Use"}
                </span>
              </div>
            </div>

            <div className="hidden lg:flex justify-center">
              <div className="relative">
                <div className="w-80 h-96 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/10 flex items-center justify-center">
                  <div className="space-y-6 p-8">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <GraduationCap className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="h-3 w-28 bg-foreground/10 rounded" />
                        <div className="h-2 w-20 bg-foreground/5 rounded mt-2" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-green-500/20 flex items-center justify-center">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="h-2.5 w-full bg-foreground/5 rounded" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-green-500/20 flex items-center justify-center">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="h-2.5 w-3/4 bg-foreground/5 rounded" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-yellow-500/20 flex items-center justify-center">
                          <TrendingUp className="h-4 w-4 text-yellow-500" />
                        </div>
                        <div className="h-2.5 w-5/6 bg-foreground/5 rounded" />
                      </div>
                    </div>
                    <div className="pt-2">
                      <div className="h-3 w-full bg-primary/10 rounded-full">
                        <div className="h-3 w-2/3 bg-primary/40 rounded-full" />
                      </div>
                      <div className="text-xs text-muted-foreground mt-2 text-center">
                        {lang === "ar" ? "67% مكتمل" : "67% Complete"}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -end-4 w-24 h-24 rounded-xl bg-primary/5 border border-primary/10 -z-10" />
                <div className="absolute -bottom-4 -start-4 w-32 h-32 rounded-xl bg-primary/5 border border-primary/10 -z-10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold font-serif">
              {t("landing.features.title")}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: FileCheck,
                title: t("landing.features.doc.title"),
                desc: t("landing.features.doc.desc"),
                gradient: "from-blue-500/10 to-blue-600/5",
                iconColor: "text-blue-500",
              },
              {
                icon: Briefcase,
                title: t("landing.features.career.title"),
                desc: t("landing.features.career.desc"),
                gradient: "from-emerald-500/10 to-emerald-600/5",
                iconColor: "text-emerald-500",
              },
              {
                icon: TrendingUp,
                title: t("landing.features.growth.title"),
                desc: t("landing.features.growth.desc"),
                gradient: "from-purple-500/10 to-purple-600/5",
                iconColor: "text-purple-500",
              },
            ].map((feature) => (
              <Card key={feature.title} className="group hover-elevate">
                <CardContent className="p-6 space-y-4">
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center`}
                  >
                    <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20" id="about">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold font-serif">
            {t("landing.about.title")}
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {t("landing.about.desc")}
          </p>
        </div>
      </section>

      <section className="py-20 bg-muted/30" id="benefits">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold font-serif">
              {t("landing.benefits.title")}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Building2,
                category: t("landing.benefits.university"),
                items: [
                  t("landing.benefits.university.1"),
                  t("landing.benefits.university.2"),
                  t("landing.benefits.university.3"),
                ],
                iconColor: "text-blue-500",
                bgColor: "bg-blue-500/10",
              },
              {
                icon: Users,
                category: t("landing.benefits.graduate"),
                items: [
                  t("landing.benefits.graduate.1"),
                  t("landing.benefits.graduate.2"),
                  t("landing.benefits.graduate.3"),
                ],
                iconColor: "text-emerald-500",
                bgColor: "bg-emerald-500/10",
              },
              {
                icon: Heart,
                category: t("landing.benefits.community"),
                items: [t("landing.benefits.community.1")],
                iconColor: "text-rose-500",
                bgColor: "bg-rose-500/10",
              },
            ].map((benefit) => (
              <Card key={benefit.category} className="hover-elevate">
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg ${benefit.bgColor} flex items-center justify-center`}
                    >
                      <benefit.icon className={`h-5 w-5 ${benefit.iconColor}`} />
                    </div>
                    <h3 className="text-lg font-semibold">{benefit.category}</h3>
                  </div>
                  <ul className="space-y-3">
                    {benefit.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20" id="howto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold font-serif">
              {t("landing.howto.title")}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              t("landing.howto.step1"),
              t("landing.howto.step2"),
              t("landing.howto.step3"),
              t("landing.howto.step4"),
            ].map((step, index) => (
              <div key={index} className="relative text-center space-y-4 p-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold">
                  {index + 1}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <a href="/api/login">
              <Button size="lg" data-testid="button-cta-bottom">
                {t("landing.hero.cta")}
                <Arrow className="h-4 w-4 ms-2" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <span className="font-semibold">{t("app.name")}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {lang === "ar"
                ? `\u00A9 ${new Date().getFullYear()} السجل المهاري. جميع الحقوق محفوظة.`
                : `\u00A9 ${new Date().getFullYear()} Skill Record. All rights reserved.`}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
