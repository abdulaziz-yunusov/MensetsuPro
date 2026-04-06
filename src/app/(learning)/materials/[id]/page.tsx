import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  ExternalLink,
  Eye,
  FileText,
  Globe,
  Lock,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { incrementMaterialViews } from "@/lib/actions/materials";
import SaveMaterialButton from "@/components/learning/save-material-button";

function getYoutubeEmbedUrl(url: string) {
  let videoId = "";
  if (url.includes("youtube.com/watch?v=")) videoId = url.split("v=")[1].split("&")[0];
  if (url.includes("youtu.be/")) videoId = url.split("youtu.be/")[1].split("?")[0];
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
}

function getMaterialTheme(type: string) {
  const normalizedType = type.toLowerCase();

  if (normalizedType === "video") {
    return {
      label: "Video Lesson",
      icon: PlayCircle,
      badgeClassName: "bg-rose-100 text-rose-700 hover:bg-rose-100",
      iconWrapClassName: "bg-rose-100 text-rose-700",
      heroClassName: "from-rose-100 via-white to-orange-50",
      accentClassName: "bg-rose-500",
      viewerLabel: "Watch inside the lesson player",
    };
  }

  if (normalizedType === "book") {
    return {
      label: "Book Resource",
      icon: BookOpen,
      badgeClassName: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
      iconWrapClassName: "bg-emerald-100 text-emerald-700",
      heroClassName: "from-emerald-100 via-white to-lime-50",
      accentClassName: "bg-emerald-500",
      viewerLabel: "Read through the embedded source",
    };
  }

  return {
    label: "Article Guide",
    icon: FileText,
    badgeClassName: "bg-orange-100 text-orange-700 hover:bg-orange-100",
    iconWrapClassName: "bg-orange-100 text-orange-700",
    heroClassName: "from-orange-100 via-white to-amber-50",
    accentClassName: "bg-orange-500",
    viewerLabel: "Browse this guide in the internal viewer",
  };
}

function getUseCases(type: string) {
  const normalizedType = type.toLowerCase();

  if (normalizedType === "video") {
    return [
      "Use this before a mock interview to internalize phrasing and tone.",
      "Pause after each key point and restate it in your own words.",
      "Replay sections where the explanation changes your answer structure.",
    ];
  }

  if (normalizedType === "book") {
    return [
      "Read with notes open and extract 3 reusable interview points.",
      "Turn each chapter into short speaking prompts for revision.",
      "Bookmark the sections that strengthen your self-introduction or motivation answers.",
    ];
  }

  return [
    "Skim once for structure, then reread while drafting your own answer.",
    "Copy key phrases into your prep notes and adapt them to your target role.",
    "Pair this with a question-bank prompt to convert reading into practice.",
  ];
}

export default async function MaterialDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  await incrementMaterialViews(id);

  const material = await prisma.material.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!material) {
    notFound();
  }

  const [isSaved, relatedMaterials] = await Promise.all([
    session?.user?.id
      ? prisma.savedMaterial.findUnique({
          where: {
            userId_materialId: {
              userId: session.user.id,
              materialId: id,
            },
          },
        }).then(Boolean)
      : Promise.resolve(false),
    prisma.material.findMany({
      where: {
        categoryId: material.categoryId,
        id: { not: material.id },
      },
      take: 3,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      include: { category: true },
    }),
  ]);

  const theme = getMaterialTheme(material.type);
  const embedUrl = material.type.toLowerCase() === "video" ? getYoutubeEmbedUrl(material.url) : null;
  const TypeIcon = theme.icon;
  const useCases = getUseCases(material.type);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
      <div className="mb-6">
        <Link
          href="/materials"
          className="inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Materials Directory
        </Link>
      </div>

      <section className={`relative overflow-hidden rounded-[32px] border border-border bg-gradient-to-br ${theme.heroClassName} p-6 shadow-sm md:p-10`}>
        <div className="absolute inset-y-0 right-0 hidden w-1/3 opacity-60 md:block">
          <div className={`absolute right-10 top-10 h-32 w-32 rounded-full blur-3xl ${theme.accentClassName} opacity-20`} />
          <div className="absolute bottom-8 right-20 h-48 w-48 rounded-full bg-card/60 blur-3xl" />
        </div>

        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_320px] lg:items-start">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={theme.badgeClassName}>
                <TypeIcon className="mr-1 h-3.5 w-3.5" />
                {theme.label}
              </Badge>
              <Badge variant="outline">{material.category.name}</Badge>
              {material.difficulty ? (
                <Badge variant="secondary" className="bg-card/80 text-card-foreground hover:bg-card/80">
                  {material.difficulty}
                </Badge>
              ) : null}
              {material.isFeatured ? (
                <Badge variant="outline" className="bg-card/70">
                  Featured
                </Badge>
              ) : null}
            </div>

            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-black tracking-tight text-foreground md:text-5xl">
                {material.title}
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-muted-foreground md:text-xl">
                {material.description || "A curated resource selected to help you prepare more effectively for Japanese interviews."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-card/80 px-4 py-2 text-sm font-medium text-card-foreground shadow-sm">
                <Eye className="h-4 w-4 text-muted-foreground" />
                {material.views} views
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-card/80 px-4 py-2 text-sm font-medium text-card-foreground shadow-sm">
                <Sparkles className="h-4 w-4 text-muted-foreground" />
                {theme.viewerLabel}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {session?.user ? (
                <SaveMaterialButton
                  materialId={material.id}
                  isInitiallySaved={isSaved}
                  showLabel={true}
                  variant="outline"
                  size="default"
                  className="border-white bg-card/90 text-foreground hover:bg-card"
                />
              ) : (
                <Button variant="outline" asChild className="border-white bg-card/80 hover:bg-card">
                  <Link href={`/login?callbackUrl=/materials/${id}`}>Sign in to save</Link>
                </Button>
              )}

              <Button asChild className="bg-foreground text-white hover:bg-slate-800">
                <a href={material.url} target="_blank" rel="noopener noreferrer">
                  Open Source
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          <Card className="border-white/70 bg-card/80 shadow-sm backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Resource Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
                <span className="text-muted-foreground">Format</span>
                <span className="font-medium text-foreground capitalize">{material.type}</span>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium text-foreground">{material.category.name}</span>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
                <span className="text-muted-foreground">Difficulty</span>
                <span className="font-medium text-foreground">{material.difficulty || "Open level"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Access</span>
                <span className="font-medium text-foreground">{session?.user ? "Unlocked" : "Members only"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_340px]">
        <section className="space-y-6">
          <Card className="overflow-hidden border-border shadow-sm">
            {!session?.user ? (
              <CardContent className="relative overflow-hidden px-6 py-16 text-center md:px-10 md:py-20">
                <div className={`absolute inset-x-6 top-0 h-1 rounded-b-full ${theme.accentClassName}`} />
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-border bg-card shadow-sm">
                  <Lock className="h-10 w-10 text-muted-foreground" />
                </div>
                <h2 className="text-3xl font-bold text-foreground">Members Only Content</h2>
                <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                  Sign in to unlock the full resource viewer, save this material, and keep your preparation organized in one place.
                </p>
                <div className="mt-8 flex justify-center">
                  <Button size="lg" asChild className="rounded-full bg-foreground px-8 text-white hover:bg-slate-800">
                    <Link href={`/login?callbackUrl=/materials/${id}`}>Sign In to Access</Link>
                  </Button>
                </div>
              </CardContent>
            ) : material.type.toLowerCase() === "video" && embedUrl ? (
              <div className="flex flex-col">
                <div className="flex flex-col gap-3 border-b border-border bg-background px-5 py-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <PlayCircle className="h-4 w-4 text-rose-500" />
                    YouTube Lesson Player
                  </div>
                  <Button size="sm" variant="outline" asChild className="w-full md:w-auto">
                    <a href={material.url} target="_blank" rel="noopener noreferrer">
                      Watch on YouTube
                      <ExternalLink className="ml-2 h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
                <div className="relative aspect-video w-full bg-slate-950">
                  <iframe
                    src={embedUrl}
                    className="absolute inset-0 h-full w-full border-0"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    title={material.title}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="flex flex-col gap-3 border-b border-border bg-background px-5 py-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    Internal Resource Viewer
                  </div>
                  <Button size="sm" variant="outline" asChild className="w-full md:w-auto">
                    <a href={material.url} target="_blank" rel="noopener noreferrer">
                      Open in New Tab
                      <ExternalLink className="ml-2 h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
                <div className="relative h-[72vh] w-full bg-card">
                  <iframe
                    src={material.url}
                    className="h-full w-full border-0"
                    title={material.title}
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  />
                  <div className="pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center bg-card/0 p-10 text-center opacity-0 transition-opacity hover:opacity-100">
                    <AlertCircle className="mb-4 h-12 w-12 text-slate-300" />
                    <p className="max-w-sm text-muted-foreground">
                      If the source blocks embedding, use the button above to open it in a new tab.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </section>

        <aside className="space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">How To Use This Resource</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {useCases.map((item) => (
                <div key={item} className="flex gap-3 text-sm text-muted-foreground">
                  <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${theme.accentClassName}`} />
                  <p>{item}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild variant="outline" className="w-full justify-between">
                <Link href="/materials">
                  Browse More Materials
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-between">
                <Link href="/questions">
                  Go To Question Bank
                  <FileText className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild className="w-full justify-between bg-foreground text-white hover:bg-slate-800">
                <Link href="/ai-interview">
                  Practice With AI Interview
                  <Sparkles className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Related Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {relatedMaterials.length > 0 ? (
                relatedMaterials.map((relatedMaterial) => {
                  const relatedTheme = getMaterialTheme(relatedMaterial.type);
                  const RelatedIcon = relatedTheme.icon;

                  return (
                    <Link
                      key={relatedMaterial.id}
                      href={`/materials/${relatedMaterial.id}`}
                      className="block rounded-2xl border border-border p-4 transition-colors hover:border-border hover:bg-background"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${relatedTheme.iconWrapClassName}`}>
                          <RelatedIcon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground">{relatedMaterial.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {relatedMaterial.type} | {relatedMaterial.category.name}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground">No related resources yet in this category.</p>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
