'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, FileDown, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

const courses = [
  {
    id: 1,
    title: 'Java OOP',
    description: 'Introduction to Object-Oriented Programming in Java',
    language: 'Java',
    slides: '/materials/java-oop-slides.pdf',
    materials: ['Chapter 1: Classes and Objects', 'Chapter 2: Inheritance', 'Chapter 3: Polymorphism'],
  },
  {
    id: 2,
    title: 'Python OOP Concepts',
    description: 'Master Object-Oriented Programming in Python',
    language: 'Python',
    slides: '/materials/python-oop-slides.pdf',
    materials: ['Chapter 1: Classes and Instances', 'Chapter 2: Encapsulation', 'Chapter 3: Abstraction'],
  },
  {
    id: 3,
    title: 'PHP OOP Basics',
    description: 'Learn Object-Oriented Programming with PHP',
    language: 'PHP',
    slides: '/materials/php-oop-slides.pdf',
    materials: ['Chapter 1: Classes and Properties', 'Chapter 2: Methods', 'Chapter 3: Constructors'],
  },
  {
    id: 4,
    title: 'C# OOP Principles',
    description: 'Understanding Object-Oriented Programming in C#',
    language: 'C#',
    slides: '/materials/csharp-oop-slides.pdf',
    materials: ['Chapter 1: Classes and Objects', 'Chapter 2: Interfaces', 'Chapter 3: Generics'],
  },
];

export default function CoursesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Course Materials</h1>
        <p className="text-slate-400 mt-1">View course materials (Read-only)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="border-slate-800 bg-slate-900/80 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-white">{course.title}</CardTitle>
                  <CardDescription className="text-slate-400 mt-1">{course.description}</CardDescription>
                </div>
                <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
                  {course.language}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-2">Materials:</h4>
                <ul className="space-y-1">
                  {course.materials.map((material, index) => (
                    <li key={index} className="text-sm text-slate-400 flex items-center gap-2">
                      <BookOpen className="h-3 w-3" />
                      {material}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex gap-2 pt-2 border-t border-slate-800">
                <Button
                  variant="outline"
                  className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Materials
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

