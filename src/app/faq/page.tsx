import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getServerTranslation } from "@/lib/i18n-server";
import type { Locale } from "@/i18n";

const faqCopy: Record<Locale, { title: string; subtitle: string; faqs: { question: string; answer: string }[] }> = {
  en: {
    title: "Frequently Asked Questions",
    subtitle: "Everything you need to know about preparing for your Japanese IT interview.",
    faqs: [
      {
        question: "What exactly is MensetsuPro?",
        answer: "MensetsuPro is a specialized platform designed to help IT professionals prepare for job interviews in Japan. We offer curated question banks, learning materials, and an AI interviewer that provides real-time feedback.",
      },
      {
        question: "Do I need to be fluent in Japanese?",
        answer: "Not necessarily. While higher Japanese proficiency like N2 or N1 opens more opportunities, many users are at N4 or N3, and some prepare only in English for international teams in Japan.",
      },
      {
        question: "How does the AI Interviewer work?",
        answer: "The AI simulates technical or behavioral interviews, asks questions, reviews your answers, and gives structured feedback on clarity, relevance, tone, and business etiquette.",
      },
      {
        question: "Is MensetsuPro free?",
        answer: "There are free and premium tiers. Core question banks and community features are free, while some advanced AI interview and technical prep features may require a subscription.",
      },
    ],
  },
  ru: {
    title: "Часто задаваемые вопросы",
    subtitle: "Все, что нужно знать о подготовке к IT-интервью в Японии.",
    faqs: [
      {
        question: "Что такое MensetsuPro?",
        answer: "MensetsuPro — это специализированная платформа для подготовки IT-специалистов к собеседованиям в Японии. Здесь есть банк вопросов, учебные материалы и AI-интервьюер с обратной связью в реальном времени.",
      },
      {
        question: "Нужно ли свободно говорить по-японски?",
        answer: "Не обязательно. Более высокий уровень вроде N2 или N1 дает больше возможностей, но многие пользователи начинают с N4, N3 или даже с английского языка для международных команд в Японии.",
      },
      {
        question: "Как работает AI Interviewer?",
        answer: "AI моделирует техническое или поведенческое интервью, задает вопросы, анализирует ваши ответы и выдает структурированный отзыв по ясности, уместности, тону и деловому этикету.",
      },
      {
        question: "MensetsuPro бесплатный?",
        answer: "Есть бесплатный и премиальный уровни. Базовый банк вопросов и функции сообщества бесплатны, а часть продвинутых AI-сценариев и технических материалов может требовать подписку.",
      },
    ],
  },
  ja: {
    title: "よくある質問",
    subtitle: "日本のIT面接対策について知っておきたい内容をまとめています。",
    faqs: [
      {
        question: "MensetsuProとは何ですか？",
        answer: "MensetsuProは、日本での就職面接に備えるIT人材向けの特化型プラットフォームです。質問バンク、学習教材、リアルタイムでフィードバックするAI面接機能を提供しています。",
      },
      {
        question: "日本語は流暢である必要がありますか？",
        answer: "必ずしもそうではありません。N2やN1の方が選択肢は広がりますが、N4やN3レベルの利用者や、英語中心で国際チームを目指す利用者も多くいます。",
      },
      {
        question: "AI Interviewerはどのように動きますか？",
        answer: "AIが技術面接や行動面接を再現し、質問を出し、回答内容を確認したうえで、明確さ、関連性、話し方、ビジネスマナーについて整理されたフィードバックを返します。",
      },
      {
        question: "MensetsuProは無料ですか？",
        answer: "無料プランとプレミアムプランがあります。基本的な質問バンクやコミュニティ機能は無料ですが、一部の高度なAI模擬面接や技術対策機能は有料になる場合があります。",
      },
    ],
  },
  uz: {
    title: "Ko'p so'raladigan savollar",
    subtitle: "Yaponiya IT intervyusiga tayyorgarlik haqida bilishingiz kerak bo'lgan asosiy ma'lumotlar.",
    faqs: [
      {
        question: "MensetsuPro nima o'zi?",
        answer: "MensetsuPro — Yaponiyadagi ish suhbatlariga tayyorlanayotgan IT mutaxassislari uchun maxsus platforma. Unda savollar banki, o'quv materiallari va real vaqt fikri beradigan AI intervyuer mavjud.",
      },
      {
        question: "Yapon tilini ravon bilishim shartmi?",
        answer: "Shart emas. N2 yoki N1 darajasi ko'proq imkoniyat beradi, ammo ko'plab foydalanuvchilar N4, N3 yoki faqat ingliz tilida tayyorlanib, Yaponiyadagi xalqaro jamoalarga kirishga harakat qiladi.",
      },
      {
        question: "AI intervyuer qanday ishlaydi?",
        answer: "AI texnik yoki xulq-atvor intervyusini taqlid qiladi, savollar beradi, javoblaringizni tahlil qiladi va aniqlik, moslik, ohang hamda biznes odobi bo'yicha tuzilgan fikr qaytaradi.",
      },
      {
        question: "MensetsuPro bepulmi?",
        answer: "Bepul va premium darajalar mavjud. Asosiy savollar banki va hamjamiyat funksiyalari bepul, ayrim chuqur AI intervyu va texnik tayyorgarlik vositalari esa obunani talab qilishi mumkin.",
      },
    ],
  },
};

export default async function FAQPage() {
  const { locale } = await getServerTranslation();
  const copy = faqCopy[locale];

  return (
    <div className="container mx-auto py-16 max-w-3xl px-4">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight">{copy.title}</h1>
        <p className="text-lg text-muted-foreground">
          {copy.subtitle}
        </p>
      </div>

      <Accordion className="w-full">
        {copy.faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`} className="border-b-slate-200 py-2">
            <AccordionTrigger className="text-left text-lg font-semibold hover:text-primary">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-base leading-relaxed pt-2 pb-4">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
