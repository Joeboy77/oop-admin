'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api/client';
import { Activity, BookOpen, Video, FileText, Clock, User, Search, Filter, TrendingUp, BarChart3 } from 'lucide-react';

interface ActivityLog {
  id: string;
  userId: string;
  activityType: string;
  action: string;
  title: string | null;
  description: string | null;
  score: number | null;
  metadata: Record<string, any> | null;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    studentId: string;
  };
}

interface ActivityStats {
  total: number;
  byType: Record<string, number>;
  today: number;
  thisWeek: number;
}

const activityTypeIcons: Record<string, any> = {
  course_accessed: BookOpen,
  video_watched: Video,
  quiz_completed: FileText,
  quiz_started: FileText,
  material_viewed: BookOpen,
  login: Activity,
  dashboard_accessed: Activity,
};

const activityTypeLabels: Record<string, string> = {
  course_accessed: 'Course Accessed',
  video_watched: 'Video Watched',
  quiz_completed: 'Quiz Completed',
  quiz_started: 'Quiz Started',
  material_viewed: 'Material Viewed',
  login: 'Login',
  dashboard_accessed: 'Dashboard Accessed',
};

function formatTimeAgo(date: string): string {
  const now = new Date();
  const activityDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - activityDate.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }

  return activityDate.toLocaleDateString();
}

export default function ActivityPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [studentFilter, setStudentFilter] = useState<string>('');

  const { data: activities, isLoading: activitiesLoading } = useQuery<ActivityLog[]>({
    queryKey: ['activities', typeFilter, studentFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (typeFilter !== 'all') {
        params.append('type', typeFilter);
      }
      if (studentFilter) {
        params.append('userId', studentFilter);
      }
      params.append('limit', '100');

      const response = await apiClient.get(`/api/admin/activities?${params.toString()}`);
      return response.data;
    }
  });

  const { data: stats, isLoading: statsLoading } = useQuery<ActivityStats>({
    queryKey: ['activityStats'],
    queryFn: async () => {
      const response = await apiClient.get('/api/admin/activity-stats');
      return response.data;
    },
  });

  const filteredActivities = useMemo(() => {
    if (!activities) return [];

    return activities.filter((activity) => {
      const matchesSearch =
        activity.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.user.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.action.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [activities, searchTerm]);

  if (activitiesLoading || statsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Activity Logs</h1>
          <p className="text-slate-400 mt-1">View all student activities and learning progress</p>
        </div>
        <div className="text-center text-slate-400 py-12">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Activity Logs</h1>
        <p className="text-slate-400 mt-1">View all student activities and learning progress</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Activities</CardTitle>
              <BarChart3 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <p className="text-xs text-slate-400 mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Today</CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.today}</div>
              <p className="text-xs text-slate-400 mt-1">Activities today</p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">This Week</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.thisWeek}</div>
              <p className="text-xs text-slate-400 mt-1">Activities this week</p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Activity Types</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{Object.keys(stats.byType).length}</div>
              <p className="text-xs text-slate-400 mt-1">Different types</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-white">All Activities</CardTitle>
              <CardDescription className="text-slate-400">
                {filteredActivities.length} activity log{filteredActivities.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            <div className="flex flex-col w-full sm:w-auto sm:flex-row items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 rounded-md bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Types</option>
                  {Object.entries(activityTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!filteredActivities || filteredActivities.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Activity className="h-12 w-12 mx-auto mb-4 text-slate-600" />
              <p>No activities found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActivities.map((activity) => {
                const Icon = activityTypeIcons[activity.activityType] || Activity;
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-4 rounded-lg bg-slate-800/50 border border-slate-800 hover:bg-slate-800 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <User className="h-4 w-4 text-slate-400" />
                            <p className="text-white font-medium">{activity.user.fullName}</p>
                            <span className="text-xs text-slate-500">({activity.user.email})</span>
                            <span className="text-xs text-slate-500">• {activity.user.studentId}</span>
                          </div>
                          {activity.title && (
                            <p className="text-slate-300 font-medium">{activity.title}</p>
                          )}
                          <p className="text-slate-300">{activity.action}</p>
                          {activity.description && (
                            <p className="text-sm text-slate-400 mt-1">{activity.description}</p>
                          )}
                          {activity.score !== null && (
                            <p className="text-sm text-primary font-medium mt-1">
                              Score: {activity.score}%
                            </p>
                          )}
                          <p className="text-xs text-slate-500 mt-1 capitalize">
                            {activityTypeLabels[activity.activityType] || activity.activityType}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Clock className="h-4 w-4" />
                          {formatTimeAgo(activity.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
