"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Tanaka Kenji",
    role: "Software Engineer @ Mercari",
    avatar: "TK",
    avatarColor: "from-blue-500 to-indigo-600",
    quote:
      "MensetsuPro was a game-changer. The AI Interviewer helped me practice my self-introduction in Japanese until I felt completely confident. I landed an offer within 3 months!",
    company: "Mercari",
    flag: "🇯🇵",
  },
  {
    id: 2,
    name: "Aisha Patel",
    role: "Frontend Developer @ LINE",
    avatar: "AP",
    avatarColor: "from-orange-400 to-rose-500",
    quote:
      "The question bank is incredibly detailed. The sample answers with 'good vs. bad' comparisons taught me exactly what Japanese interviewers expect. The IT coding tasks were also perfect preparation.",
    company: "LINE",
    flag: "🇮🇳",
  },
  {
    id: 3,
    name: "Carlos Mendez",
    role: "Backend Developer @ Recruit",
    avatar: "CM",
    avatarColor: "from-emerald-500 to-teal-600",
    quote:
      "As a non-native Japanese speaker, the Keigo (polite speech) feedback from the AI was invaluable. MensetsuPro bridged the cultural gap I was missing in my interview preparation.",
    company: "Recruit",
    flag: "🇲🇽",
  },
  {
    id: 4,
    name: "Yuki Nakamura",
    role: "DevOps Engineer @ CyberAgent",
    avatar: "YN",
    avatarColor: "from-violet-500 to-purple-600",
    quote:
      "I used the coding practice module every day for 6 weeks. The split-pane editor and real-time test feedback mirrored actual technical assessments. Highly recommended!",
    company: "CyberAgent",
    flag: "🇯🇵",
  },
  {
    id: 5,
    name: "Li Wei",
    role: "Full-Stack Developer @ DeNA",
    avatar: "LW",
    avatarColor: "from-cyan-500 to-blue-600",
    quote:
      "The learning materials collection is exceptional — curated videos and articles on Japanese business culture that you won't find easily elsewhere. MensetsuPro gave me a real edge.",
    company: "DeNA",
    flag: "🇨🇳",
  },
];

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveIndex((index + testimonials.length) % testimonials.length);
        setIsTransitioning(false);
      }, 200);
    },
    [isTransitioning]
  );

  const next = useCallback(
    () => goTo(activeIndex + 1),
    [goTo, activeIndex]
  );
  const prev = useCallback(
    () => goTo(activeIndex - 1),
    [goTo, activeIndex]
  );

  // Auto-advance every 6 seconds
  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const t = testimonials[activeIndex];

  return (
    <section className="py-20 bg-[#1e3a8a] relative overflow-hidden">
      {/* Background circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-card/5 rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-card/5 rounded-full" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white mb-3">
            Success Stories
          </h2>
          <p className="text-blue-200 text-lg max-w-xl mx-auto">
            Join hundreds of students who have landed their dream IT jobs in
            Japan using MensetsuPro.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto mb-14">
          {[
            { value: "500+", label: "Students" },
            { value: "92%", label: "Success Rate" },
            { value: "50+", label: "Companies" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-blue-300 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Testimonial carousel */}
        <div className="max-w-3xl mx-auto">
          <div
            className="bg-card/10 backdrop-blur-sm rounded-2xl p-8 md:p-12 transition-opacity duration-200"
            style={{ opacity: isTransitioning ? 0 : 1 }}
          >
            <Quote className="text-orange-400 mb-6" size={36} />

            <p className="text-white text-lg md:text-xl leading-relaxed mb-8 italic">
              &ldquo;{t.quote}&rdquo;
            </p>

            <div className="flex items-center gap-4">
              <div
                className={`h-12 w-12 rounded-full bg-gradient-to-br ${t.avatarColor} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
              >
                {t.avatar}
              </div>
              <div>
                <div className="font-semibold text-white">
                  {t.flag} {t.name}
                </div>
                <div className="text-blue-200 text-sm">{t.role}</div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="h-10 w-10 rounded-full bg-card/10 hover:bg-card/20 flex items-center justify-center text-white transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === activeIndex ? "w-6 bg-orange-400" : "w-2 bg-card/30"
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="h-10 w-10 rounded-full bg-card/10 hover:bg-card/20 flex items-center justify-center text-white transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
