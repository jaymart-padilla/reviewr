// import { LogoIcon } from '@/components/Logo';
import { BookOpen } from 'lucide-react';

const DEFAULT_ERR_MESSAGE = 'Something went wrong. Please try again.';
const BRAND = {
  title: 'Reviewr',
  subtitle: 'Your personal AI study assistant',
  description:
    'An AI-powered reviewer platform where users create their own knowledge-based reviewers by uploading documents and chatting with them. Designed for educators, students, reviewers, trainers, and professionals who want AI assistants grounded in their own learning materials.',
  logo: BookOpen,
} as const;

export { DEFAULT_ERR_MESSAGE, BRAND };
