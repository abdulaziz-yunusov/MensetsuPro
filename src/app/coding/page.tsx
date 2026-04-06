import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Code2, Target, Trophy } from "lucide-react";

export default function CodingPracticeHub() {
  const problems = [
    { id: "two-sum", title: "Two Sum", difficulty: "Easy", category: "Arrays", accepted: "85%" },
    { id: "valid-parentheses", title: "Valid Parentheses", difficulty: "Easy", category: "Stacks", accepted: "70%" },
    { id: "lru-cache", title: "LRU Cache", difficulty: "Medium", category: "Design", accepted: "45%" },
    { id: "merge-k-lists", title: "Merge k Sorted Lists", difficulty: "Hard", category: "Linked Lists", accepted: "25%" }
  ];

  return (
    <div className="container mx-auto py-10 max-w-5xl space-y-8 px-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight flex items-center">
             <Code2 className="w-10 h-10 mr-4 text-primary" /> Coding Practice
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Master algorithmic thinking in preparation for technical Japanese IT interviews.
          </p>
        </div>
        <div className="flex gap-4">
          <Card className="bg-emerald-50 border-emerald-200">
            <CardContent className="p-4 flex items-center">
              <Trophy className="w-8 h-8 mr-3 text-emerald-500" />
              <div>
                <p className="text-xs text-emerald-700 font-semibold uppercase">Solved</p>
                <p className="text-xl font-bold text-emerald-900">0</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4">
        {problems.map(p => (
          <Card key={p.id} className="hover:border-primary transition-colors">
            <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold">{p.title}</h3>
                  <Badge variant={p.difficulty === 'Easy' ? 'secondary' : p.difficulty === 'Medium' ? 'default' : 'destructive'}>
                    {p.difficulty}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-4">
                  <span className="flex items-center"><Target className="w-4 h-4 mr-1"/> {p.category}</span>
                  <span>Acceptance: {p.accepted}</span>
                </div>
              </div>
              <Button asChild size="lg" className="w-full md:w-auto shrink-0">
                <Link href={`/coding/${p.id}`}>Solve Challenge</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
