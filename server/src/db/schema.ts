import { serial, text, pgTable, timestamp, integer, jsonb, pgEnum } from 'drizzle-orm/pg-core';

// Define enums for PostgreSQL
export const subjectEnum = pgEnum('subject', [
  'Matematika',
  'IPA',
  'IPS',
  'Bahasa Indonesia',
  'Bahasa Inggris',
  'Sejarah',
  'Geografi',
  'Ekonomi',
  'Sosiologi',
  'Fisika',
  'Kimia',
  'Biologi',
  'PKN',
  'PJOK',
  'Seni Budaya',
  'Prakarya',
  'Informatika'
]);

export const gradeEnum = pgEnum('grade', [
  '1 SD', '2 SD', '3 SD', '4 SD', '5 SD', '6 SD',
  '7 SMP', '8 SMP', '9 SMP',
  '10 SMA', '11 SMA', '12 SMA',
  '10 SMK', '11 SMK', '12 SMK'
]);

export const semesterEnum = pgEnum('semester', ['1', '2']);

// Lesson plans table
export const lessonPlansTable = pgTable('lesson_plans', {
  id: text('id').primaryKey(), // Using UUID as text
  subject: subjectEnum('subject').notNull(),
  material: text('material').notNull(),
  grade: gradeEnum('grade').notNull(),
  semester: semesterEnum('semester').notNull(),
  learning_objectives: jsonb('learning_objectives').notNull(), // Store as JSONB array
  teaching_methods: jsonb('teaching_methods').notNull(), // Store as JSONB array
  materials_tools: jsonb('materials_tools').notNull(), // Store as JSONB array
  learning_activities: jsonb('learning_activities').notNull(), // Store as JSONB array
  assessments: jsonb('assessments').notNull(), // Store as JSONB array
  references: jsonb('references').notNull(), // Store as JSONB array
  total_duration_minutes: integer('total_duration_minutes').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// TypeScript types for the table schema
export type LessonPlan = typeof lessonPlansTable.$inferSelect; // For SELECT operations
export type NewLessonPlan = typeof lessonPlansTable.$inferInsert; // For INSERT operations

// Export all tables and relations for proper query building
export const tables = { lessonPlans: lessonPlansTable };