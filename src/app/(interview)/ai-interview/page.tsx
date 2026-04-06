import { Metadata } from "next";

import AIInterviewSwitcher from "@/components/interview/ai-interview-switcher";

export const metadata: Metadata = {
  title: "AI Interview | MensetsuPro",
  description: "Configure, run, and review an AI mock interview or coding test session.",
};

export default function AIInterviewPage() {
  return <AIInterviewSwitcher />;
}
