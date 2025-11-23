"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, BarChart3 } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

type LanguageProgress = { name: string; progress: number };

type StudentSummary = {
  id: string;
  name: string;
  email: string;
  overallProgress: number;
  coursesCompleted: number;
  videosWatched: number;
  quizzesCompleted: number;
  currentStreak: number;
  languages: LanguageProgress[];
};

export default function ProgressPage() {
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiClient
      .get('/api/admin/progress/students')
      .then((res) => {
        if (!mounted) return;
        setStudents(res.data || []);
      })
      .catch((err) => {
        console.error('Failed to load student progress', err);
        if (!mounted) return;
        setError(err?.response?.data?.message || err.message || 'Failed to load data');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const averageProgress = students.length
    ? Math.round(students.reduce((s, st) => s + (st.overallProgress || 0), 0) / students.length)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Progress Tracking</h1>
        <p className="text-slate-400 mt-1">Monitor student progress and learning achievements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Average Progress</CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{loading ? '—' : `${averageProgress}%`}</div>
            <p className="text-xs text-slate-400 mt-1">Across all students</p>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Active Students</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{loading ? '—' : students.length}</div>
            <p className="text-xs text-slate-400 mt-1">Currently learning</p>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Courses</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">4</div>
            <p className="text-xs text-slate-400 mt-1">Available courses</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {loading && <div className="text-slate-400">Loading student progress…</div>}
        {error && <div className="text-red-500">{error}</div>}

        {!loading && !error && students.map((student) => (
          <Card key={student.id} className="border-slate-800 bg-slate-900/80 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">{student.name}</CardTitle>
                  <CardDescription className="text-slate-400">{student.email}</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{student.overallProgress}%</div>
                  <p className="text-xs text-slate-400">Overall Progress</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-slate-400">Courses</p>
                  <p className="text-lg font-bold text-white">{student.coursesCompleted}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Videos</p>
                  <p className="text-lg font-bold text-white">{student.videosWatched}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Quizzes</p>
                  <p className="text-lg font-bold text-white">{student.quizzesCompleted}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Streak</p>
                  <p className="text-lg font-bold text-white">{student.currentStreak} days</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-300">Progress by Language</p>
                {student.languages.map((lang) => (
                  <div key={lang.name} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">{lang.name}</span>
                      <span className="text-slate-400">{lang.progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${lang.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

