import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

export function LanguageToggle() {
  const { lang, setLang } = useI18n();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLang(lang === "ar" ? "en" : "ar")}
      data-testid="button-language-toggle"
      className="gap-1.5 font-medium"
    >
      <Languages className="h-4 w-4" />
      <span>{lang === "ar" ? "EN" : "عربي"}</span>
    </Button>
  );
}
