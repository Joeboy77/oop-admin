'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api/client';
import Link from 'next/link';

type Quiz = {
  id: string | number;
  title: string;
  description?: string;
  language?: string;
  questions?: number;
  [key: string]: unknown;
};

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1) Fetch all lessons, then fetch quizzes for each lesson
        const lessonsRes = await apiClient.get('/api/lessons');
        const lessons: Array<Record<string, unknown>> = lessonsRes.data || [];

        // Fetch quizzes for each lesson in parallel
        const quizzesByLesson = await Promise.all(
          lessons.map(async (lesson) => {
            const l = lesson as Record<string, unknown>;
            const lessonId = (l.id as string | number) || (l._id as string | number);
            try {
              const res = await apiClient.get(`/api/quizzes/lesson/${lessonId}`);
              return res.data || [];
            } catch {
              // If a lesson has no quizzes or the request fails, just return empty
              return [];
            }
          })
        );

        // Flatten and dedupe by id
        const flat: Quiz[] = ([] as Quiz[]).concat(...quizzesByLesson);
        const dedup = new Map<string | number, Quiz>();
        flat.forEach((q) => {
          const id = q.id || q._id;
          if (id && !dedup.has(id)) {
            dedup.set(id, {
              ...q,
              id,
              title: q.title || 'Untitled Quiz',
              description: q.description || '',
              language: q.language || q.language_code || 'Unknown',
              questions: Array.isArray(q.questions) ? q.questions.length : q.questions || 0,
            });
          }
        });

        if (mounted) {
          setQuizzes(Array.from(dedup.values()));
        }
      } catch (err: unknown) {
        if (mounted) {
          const message = err instanceof Error ? err.message : String(err);
          setError(message || 'Failed to load quizzes');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchQuizzes();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Quizzes</h1>
        <p className="text-slate-400 mt-1">View all available quizzes (Read-only)</p>
      </div>

      {loading ? (
        <div className="text-slate-400">Loading quizzes...</div>
      ) : error ? (
        <div className="text-red-400">Error: {error}</div>
      ) : quizzes.length === 0 ? (
        <div className="text-slate-400">No quizzes found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="border-slate-800 bg-slate-900/80 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white">{quiz.title}</CardTitle>
                    <CardDescription className="text-slate-400 mt-1">{quiz.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
                    {quiz.language}
                  </span>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <FileText className="h-4 w-4" />
                    {quiz.questions} questions
                  </div>
                </div>
                <Link href={`/admin/quizzes/${String(quiz.id)}`} className="w-full">
                  <Button
                    variant="outline"
                    className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Quiz
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

