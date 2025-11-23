'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api/client';
import Link from 'next/link';

type QuizDetail = {
  id: string | number;
  title: string;
  description?: string;
  questions?: Array<{ id?: string | number; text?: string }>;
  [key: string]: unknown;
};

export default function QuizDetailPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params?.quizId as string | undefined;

  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!quizId) return;
    let mounted = true;

    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/api/quizzes/${quizId}`);
        if (mounted) setQuiz(res.data || null);
      } catch (err: unknown) {
        if (mounted) {
          const message = err instanceof Error ? err.message : String(err);
          setError(message || 'Failed to load quiz');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchQuiz();
    return () => {
      mounted = false;
    };
  }, [quizId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Quiz details</h1>
          <p className="text-slate-400 mt-1">View quiz content and questions (Read-only)</p>
        </div>
        <div>
          <Link href="/admin/quizzes">
            <Button variant="ghost">Back</Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-slate-400">Loading quiz...</div>
      ) : error ? (
        <div className="text-red-400">Error: {error}</div>
      ) : !quiz ? (
        <div className="text-slate-400">Quiz not found.</div>
      ) : (
        <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-white">{String(quiz.title)}</CardTitle>
                <CardDescription className="text-slate-400 mt-1">{String(quiz.description || '')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm text-slate-400 mb-2">Questions</h3>
              {Array.isArray(quiz.questions) && quiz.questions.length > 0 ? (
                <ul className="list-disc pl-5 space-y-2 text-slate-300">
                  {quiz.questions.map((q, idx) => (
                    <li key={(q as any).id || idx}>{String((q as any).text || (q as any).question || `Question ${idx + 1}`)}</li>
                  ))}
                </ul>
              ) : (
                <div className="text-slate-400">No questions available.</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
