'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, FileDown, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api/client';

type CourseMaterial = {
  id: string | number;
  title: string;
  description?: string;
  language?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
};

function formatFileSize(bytes?: number) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function CoursesPage() {
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiClient.get('/api/courses', { signal: controller.signal });
        const data = res.data;
        setMaterials(Array.isArray(data) ? data : []);
      } catch (err: any) {
        // axios uses a different cancellation error shape. Treat aborted/canceled requests as non-errors.
        const isCanceled =
          err?.name === 'AbortError' || err?.code === 'ERR_CANCELED' || err?.message === 'canceled';
        if (!isCanceled) {
          const msg = err?.response?.data?.message ?? err.message ?? 'Failed to load materials';
          setError(msg);
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Course Materials</h1>
        <p className="text-slate-400 mt-1">View course materials (Read-only)</p>
      </div>

      {loading ? (
        <p className="text-slate-400">Loading materials...</p>
      ) : error ? (
        <p className="text-rose-400">Error: {error}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {materials.map((m) => (
            <Card key={m.id} className="border-slate-800 bg-slate-900/80 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-white">{m.title}</CardTitle>
                    {m.description && (
                      <CardDescription className="text-slate-400 mt-1">{m.description}</CardDescription>
                    )}
                  </div>
                  {m.language && (
                    <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
                      {m.language}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">File:</h4>
                  <ul className="space-y-1">
                    <li className="text-sm text-slate-400 flex items-center gap-2">
                      <BookOpen className="h-3 w-3" />
                      <div className="flex-1">
                        <div className="truncate">{m.fileName ?? m.title}</div>
                        <div className="text-xs text-slate-500">{formatFileSize(m.fileSize)}</div>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="flex gap-2 pt-2 border-t border-slate-800">
                  <a
                    href={m.fileUrl ?? '#'}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`View ${m.fileName ?? m.title}`}
                    className="flex-1"
                  >
                    <Button
                      variant="outline"
                      className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 flex items-center justify-center"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Materials
                    </Button>
                  </a>
                  {m.fileUrl && (
                    <a href={m.fileUrl} download aria-label={`Download ${m.fileName ?? m.title}`}>
                      <Button className="h-9 w-9 p-0 flex items-center justify-center">
                        <FileDown className="h-4 w-4" />
                      </Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

