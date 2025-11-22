'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api/client';
import { Users, Search, Mail, GraduationCap, CheckCircle2, XCircle, CheckSquare, Square, Filter } from 'lucide-react';
import { toast } from 'sonner';

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

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

export default function StudentsPage() {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  useEffect(() => {
    const statusParam = searchParams.get('status');
    if (statusParam && ['all', 'pending', 'approved', 'rejected'].includes(statusParam)) {
      setStatusFilter(statusParam as StatusFilter);
    }
  }, [searchParams]);

  const { data: students, isLoading } = useQuery<Student[]>({
    queryKey: ['allStudents'],
    queryFn: async () => {
      const response = await apiClient.get('/api/auth/admin/all-students');
      return response.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiClient.post(`/api/auth/admin/approve/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allStudents'] });
      toast.success('Student approved!', {
        description: 'The student has been approved successfully',
      });
    },
    onError: (error: any) => {
      toast.error('Approval failed', {
        description: error.response?.data?.message || 'Failed to approve student',
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason?: string }) => {
      await apiClient.post(`/api/auth/admin/reject/${userId}`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allStudents'] });
      toast.success('Student rejected', {
        description: 'The student has been rejected',
      });
    },
    onError: (error: any) => {
      toast.error('Rejection failed', {
        description: error.response?.data?.message || 'Failed to reject student',
      });
    },
  });

  const bulkApproveMutation = useMutation({
    mutationFn: async (userIds: string[]) => {
      await apiClient.post('/api/auth/admin/bulk-approve', { userIds });
    },
    onSuccess: (_, userIds) => {
      queryClient.invalidateQueries({ queryKey: ['allStudents'] });
      setSelectedStudents(new Set());
      toast.success('Students approved!', {
        description: `${userIds.length} student(s) have been approved successfully`,
      });
    },
    onError: (error: any) => {
      toast.error('Approval failed', {
        description: error.response?.data?.message || 'Failed to approve students',
      });
    },
  });

  const toggleStudentSelection = (studentId: string) => {
    const newSelection = new Set(selectedStudents);
    if (newSelection.has(studentId)) {
      newSelection.delete(studentId);
    } else {
      newSelection.add(studentId);
    }
    setSelectedStudents(newSelection);
  };

  const toggleAllStudents = () => {
    if (!filteredStudents) return;
    
    const pendingStudents = filteredStudents.filter(s => s.status === 'pending');
    if (selectedStudents.size === pendingStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(pendingStudents.map((s) => s.id)));
    }
  };

  const handleBulkApprove = () => {
    if (selectedStudents.size === 0) {
      toast.error('No students selected', {
        description: 'Please select at least one pending student to approve',
      });
      return;
    }
    bulkApproveMutation.mutate(Array.from(selectedStudents));
  };

  const handleApprove = (studentId: string) => {
    approveMutation.mutate(studentId);
  };

  const handleReject = (studentId: string) => {
    if (confirm('Are you sure you want to reject this student?')) {
      rejectMutation.mutate({ userId: studentId });
    }
  };

  const filteredStudents = students?.filter((student) => {
    const matchesSearch =
      student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const pendingStudents = filteredStudents?.filter(s => s.status === 'pending') || [];
  const hasPendingSelected = Array.from(selectedStudents).some(id => 
    pendingStudents.some(s => s.id === id)
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Students</h1>
          <p className="text-slate-400 mt-1">Manage and view all registered students</p>
        </div>
        <div className="text-center text-slate-400 py-12">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Students</h1>
        <p className="text-slate-400 mt-1">Manage and view all registered students</p>
      </div>

      <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-white">All Students</CardTitle>
              <CardDescription className="text-slate-400">
                {filteredStudents?.length || 0} of {students?.length || 0} students
                {statusFilter !== 'all' && ` (${statusFilter})`}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="px-3 py-2 rounded-md bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              {hasPendingSelected && (
                <Button
                  onClick={handleBulkApprove}
                  disabled={bulkApproveMutation.isPending}
                  className="bg-primary hover:bg-primary/90"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approve Selected ({selectedStudents.size})
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!filteredStudents || filteredStudents.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Users className="h-12 w-12 mx-auto mb-4 text-slate-600" />
              <p>No students found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingStudents.length > 0 && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-800/50 border border-slate-700 mb-4">
                  <button
                    onClick={toggleAllStudents}
                    className="flex items-center justify-center w-5 h-5 rounded border border-slate-600 hover:border-primary transition-colors"
                  >
                    {selectedStudents.size === pendingStudents.length && pendingStudents.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-primary" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                  <span className="text-sm text-slate-300">
                    Select all pending ({pendingStudents.length})
                  </span>
                </div>
              )}

              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="p-4 rounded-lg bg-slate-800/50 border border-slate-800 hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {student.status === 'pending' && (
                      <button
                        onClick={() => toggleStudentSelection(student.id)}
                        className="flex items-center justify-center w-5 h-5 rounded border border-slate-600 hover:border-primary transition-colors mt-1"
                      >
                        {selectedStudents.has(student.id) ? (
                          <CheckSquare className="w-4 h-4 text-primary" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    )}
                    {student.status !== 'pending' && <div className="w-5" />}

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Full Name</p>
                        <p className="text-white font-medium">{student.fullName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400 mb-1 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          Email
                        </p>
                        <p className="text-white">{student.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400 mb-1 flex items-center gap-1">
                          <GraduationCap className="h-3 w-3" />
                          Student ID
                        </p>
                        <p className="text-white">{student.studentId || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Status</p>
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            student.status === 'approved'
                              ? 'bg-green-500/20 text-green-500'
                              : student.status === 'pending'
                              ? 'bg-yellow-500/20 text-yellow-500'
                              : 'bg-red-500/20 text-red-500'
                          }`}
                        >
                          {student.status}
                        </span>
                      </div>
                      {student.program && (
                        <div>
                          <p className="text-sm text-slate-400 mb-1">Program</p>
                          <p className="text-white">{student.program}</p>
                        </div>
                      )}
                      {student.yearOfStudy && (
                        <div>
                          <p className="text-sm text-slate-400 mb-1">Year of Study</p>
                          <p className="text-white">{student.yearOfStudy}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Registered</p>
                        <p className="text-white text-sm">
                          {new Date(student.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {student.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApprove(student.id)}
                          disabled={approveMutation.isPending}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleReject(student.id)}
                          disabled={rejectMutation.isPending}
                          size="sm"
                          variant="destructive"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
