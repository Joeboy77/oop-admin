'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Target, BarChart3 } from 'lucide-react';
import { Select } from '@/components/ui/select';

const studentProgress = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    overallProgress: 65,
    coursesCompleted: 2,
    videosWatched: 8,
    quizzesCompleted: 4,
    currentStreak: 5,
    languages: [
      { name: 'Java', progress: 75 },
      { name: 'Python', progress: 60 },
      { name: 'PHP', progress: 50 },
      { name: 'C#', progress: 40 },
    ],
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    overallProgress: 45,
    coursesCompleted: 1,
    videosWatched: 5,
    quizzesCompleted: 2,
    currentStreak: 3,
    languages: [
      { name: 'Java', progress: 50 },
      { name: 'Python', progress: 40 },
      { name: 'PHP', progress: 0 },
      { name: 'C#', progress: 0 },
    ],
  },
];

export default function ProgressPage() {
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
            <div className="text-2xl font-bold text-white">55%</div>
            <p className="text-xs text-slate-400 mt-1">Across all students</p>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Active Students</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{studentProgress.length}</div>
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
        {studentProgress.map((student) => (
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

