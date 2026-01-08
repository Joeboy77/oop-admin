'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api/client';
import { Users, UserCheck, UserX, Clock, TrendingUp, BookOpen, GraduationCap, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Student {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  studentId?: string;
  program?: string;
  yearOfStudy?: string;
  status: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const { data: students, isLoading } = useQuery<Student[]>({
    queryKey: ['allStudents'],
    queryFn: async () => {
      const response = await apiClient.get('/api/auth/admin/all-students');
      return response.data;
    },
  });

  const analytics = useMemo(() => {
    if (!students) {
      return {
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
        recentRegistrations: [],
        byProgram: {} as Record<string, number>,
        byYear: {} as Record<string, number>,
        last7Days: 0,
        last30Days: 0,
      };
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const stats = {
      total: students.length,
      approved: students.filter((s) => s.status === 'approved').length,
      pending: students.filter((s) => s.status === 'pending').length,
      rejected: students.filter((s) => s.status === 'rejected').length,
      recentRegistrations: students
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
      byProgram: {} as Record<string, number>,
      byYear: {} as Record<string, number>,
      last7Days: 0,
      last30Days: 0,
    };

    students.forEach((student) => {
      if (student.program) {
        stats.byProgram[student.program] = (stats.byProgram[student.program] || 0) + 1;
      }
      if (student.yearOfStudy) {
        stats.byYear[student.yearOfStudy] = (stats.byYear[student.yearOfStudy] || 0) + 1;
      }

      const createdAt = new Date(student.createdAt);
      if (createdAt >= sevenDaysAgo) {
        stats.last7Days++;
      }
      if (createdAt >= thirtyDaysAgo) {
        stats.last30Days++;
      }
    });

    return stats;
  }, [students]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-slate-400 mt-1">Overview of students and course activities</p>
        </div>
        <div className="text-center text-slate-400 py-12">Loading...</div>
      </div>
    );
  }

  const approvalRate = analytics.total > 0
    ? ((analytics.approved / analytics.total) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-slate-400 mt-1">Overview of students and course activities</p>
        </div>
        <Link href="/admin/students">
          <Button className="bg-primary hover:bg-primary/90">
            <Users className="w-4 h-4 mr-2" />
            Manage Students
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Students</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analytics.total}</div>
            <p className="text-xs text-slate-400 mt-1">All registered students</p>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Approved</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{analytics.approved}</div>
            <p className="text-xs text-slate-400 mt-1">
              {approvalRate}% approval rate
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{analytics.pending}</div>
            <p className="text-xs text-slate-400 mt-1">
              {analytics.pending > 0 ? (
                <Link href="/admin/students?status=pending" className="text-primary hover:underline">
                  Review pending
                </Link>
              ) : (
                'No pending approvals'
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Rejected</CardTitle>
            <UserX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{analytics.rejected}</div>
            <p className="text-xs text-slate-400 mt-1">Rejected applications</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white">Registration Trends</CardTitle>
            <CardDescription className="text-slate-400">Recent student registrations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-white font-medium">Last 7 Days</p>
                  <p className="text-sm text-slate-400">New registrations</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-primary">{analytics.last7Days}</div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-white font-medium">Last 30 Days</p>
                  <p className="text-sm text-slate-400">New registrations</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-primary">{analytics.last30Days}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white">Students by Program</CardTitle>
            <CardDescription className="text-slate-400">Distribution across programs</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(analytics.byProgram).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(analytics.byProgram)
                  .sort(([, a], [, b]) => b - a)
                  .map(([program, count]) => (
                    <div key={program} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-primary" />
                        <span className="text-white">{program || 'Not specified'}</span>
                      </div>
                      <span className="text-primary font-semibold">{count}</span>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <BookOpen className="h-8 w-8 mx-auto mb-2 text-slate-600" />
                <p>No program data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white">Students by Year of Study</CardTitle>
            <CardDescription className="text-slate-400">Distribution across year levels</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(analytics.byYear).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(analytics.byYear)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([year, count]) => (
                    <div key={year} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <span className="text-white">Year {year || 'Not specified'}</span>
                      </div>
                      <span className="text-primary font-semibold">{count}</span>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <BookOpen className="h-8 w-8 mx-auto mb-2 text-slate-600" />
                <p>No year data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white">Recent Registrations</CardTitle>
            <CardDescription className="text-slate-400">Latest student registrations</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.recentRegistrations.length > 0 ? (
              <div className="space-y-3">
                {analytics.recentRegistrations.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-white font-medium">{student.fullName}</p>
                      <p className="text-sm text-slate-400">{student.email}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${student.status === 'approved'
                            ? 'bg-green-500/20 text-green-500'
                            : student.status === 'pending'
                              ? 'bg-yellow-500/20 text-yellow-500'
                              : 'bg-red-500/20 text-red-500'
                          }`}
                      >
                        {student.status}
                      </span>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(student.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Users className="h-8 w-8 mx-auto mb-2 text-slate-600" />
                <p>No recent registrations</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
