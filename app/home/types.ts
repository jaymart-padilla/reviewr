export type BookChapterId =
  | 'cover'
  | (typeof import('@/app/home/constants').bookChapters)[number]['id'];
