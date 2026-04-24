import { Metadata } from "next";

import AIInterviewWorkspace from "@/components/interview/ai-interview-workspace";

export const metadata: Metadata = {
  title: "AI Interview Session | MensetsuPro",
  description: "Resume an active AI interview session.",
};

export default async function AIInterviewSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AIInterviewWorkspace resumeSessionId={id} />;
}
