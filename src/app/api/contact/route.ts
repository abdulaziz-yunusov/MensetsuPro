import { NextResponse } from "next/server";

const supportEmail = process.env.CONTACT_SUPPORT_EMAIL || "ayunusov238@gmail.com";
const allowedTopics = new Set([
  "Bug report",
  "Feature request",
  "General feedback",
  "Account help",
  "Other",
]);

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const { topic, email, message } = (await request.json()) as {
      topic?: string;
      email?: string;
      message?: string;
    };

    const normalizedTopic = typeof topic === "string" && allowedTopics.has(topic)
      ? topic
      : "General feedback";
    const normalizedEmail = typeof email === "string" ? email.trim() : "";
    const normalizedMessage = typeof message === "string" ? message.trim() : "";

    if (normalizedEmail && !isValidEmail(normalizedEmail)) {
      return NextResponse.json(
        { error: "Enter a valid email address or leave it blank." },
        { status: 400 },
      );
    }

    if (normalizedMessage.length < 10) {
      return NextResponse.json(
        { error: "Write a little more detail before sending your message." },
        { status: 400 },
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.CONTACT_FROM_EMAIL;

    if (!resendApiKey || !fromEmail) {
      return NextResponse.json(
        {
          error:
            "Contact email is not configured yet. Add RESEND_API_KEY and CONTACT_FROM_EMAIL to enable direct sending.",
        },
        { status: 503 },
      );
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [supportEmail],
        reply_to: normalizedEmail || undefined,
        subject: `[MensetsuPro] ${normalizedTopic}`,
        text: [
          `Topic: ${normalizedTopic}`,
          `Reply email: ${normalizedEmail || "Not provided"}`,
          "",
          "Message:",
          normalizedMessage,
        ].join("\n"),
      }),
    });

    if (!resendResponse.ok) {
      const resendError = (await resendResponse.json().catch(() => null)) as
        | { message?: string; error?: { message?: string } }
        | null;

      return NextResponse.json(
        {
          error:
            resendError?.message ||
            resendError?.error?.message ||
            "The support message could not be sent.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Unexpected error while sending your message." },
      { status: 500 },
    );
  }
}
