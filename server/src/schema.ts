import { z } from 'zod';

// Subject enum for dropdown
export const subjectEnum = z.enum([
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

export type Subject = z.infer<typeof subjectEnum>;

// Grade enum for dropdown
export const gradeEnum = z.enum([
  '1 SD', '2 SD', '3 SD', '4 SD', '5 SD', '6 SD',
  '7 SMP', '8 SMP', '9 SMP',
  '10 SMA', '11 SMA', '12 SMA',
  '10 SMK', '11 SMK', '12 SMK'
]);

export type Grade = z.infer<typeof gradeEnum>;

// Semester enum for dropdown
export const semesterEnum = z.enum(['1', '2']);

export type Semester = z.infer<typeof semesterEnum>;

// Learning objective schema
export const learningObjectiveSchema = z.object({
  id: z.string(),
  description: z.string(),
  indicator: z.string()
});

export type LearningObjective = z.infer<typeof learningObjectiveSchema>;

// Teaching method schema
export const teachingMethodSchema = z.object({
  name: z.string(),
  description: z.string(),
  duration_minutes: z.number().int().positive()
});

export type TeachingMethod = z.infer<typeof teachingMethodSchema>;

// Material and tool schema
export const materialToolSchema = z.object({
  name: z.string(),
  type: z.enum(['alat', 'bahan']),
  description: z.string().optional()
});

export type MaterialTool = z.infer<typeof materialToolSchema>;

// Learning activity schema
export const learningActivitySchema = z.object({
  step: z.number().int().positive(),
  activity: z.string(),
  duration_minutes: z.number().int().positive(),
  description: z.string()
});

export type LearningActivity = z.infer<typeof learningActivitySchema>;

// Assessment schema
export const assessmentSchema = z.object({
  type: z.enum(['formatif', 'sumatif']),
  method: z.string(),
  description: z.string(),
  criteria: z.string()
});

export type Assessment = z.infer<typeof assessmentSchema>;

// Reference schema
export const referenceSchema = z.object({
  title: z.string(),
  author: z.string().optional(),
  url: z.string().optional(),
  type: z.enum(['buku', 'website', 'video', 'artikel'])
});

export type Reference = z.infer<typeof referenceSchema>;

// Main lesson plan schema
export const lessonPlanSchema = z.object({
  id: z.string(),
  subject: subjectEnum,
  material: z.string(),
  grade: gradeEnum,
  semester: semesterEnum,
  learning_objectives: z.array(learningObjectiveSchema),
  teaching_methods: z.array(teachingMethodSchema),
  materials_tools: z.array(materialToolSchema),
  learning_activities: z.array(learningActivitySchema),
  assessments: z.array(assessmentSchema),
  references: z.array(referenceSchema),
  total_duration_minutes: z.number().int().positive(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type LessonPlan = z.infer<typeof lessonPlanSchema>;

// Input schema for creating lesson plans
export const createLessonPlanInputSchema = z.object({
  subject: subjectEnum,
  material: z.string().min(1, 'Material tidak boleh kosong'),
  grade: gradeEnum,
  semester: semesterEnum
});

export type CreateLessonPlanInput = z.infer<typeof createLessonPlanInputSchema>;

// Input schema for updating lesson plans
export const updateLessonPlanInputSchema = z.object({
  id: z.string(),
  subject: subjectEnum.optional(),
  material: z.string().min(1).optional(),
  grade: gradeEnum.optional(),
  semester: semesterEnum.optional(),
  learning_objectives: z.array(learningObjectiveSchema).optional(),
  teaching_methods: z.array(teachingMethodSchema).optional(),
  materials_tools: z.array(materialToolSchema).optional(),
  learning_activities: z.array(learningActivitySchema).optional(),
  assessments: z.array(assessmentSchema).optional(),
  references: z.array(referenceSchema).optional(),
  total_duration_minutes: z.number().int().positive().optional()
});

export type UpdateLessonPlanInput = z.infer<typeof updateLessonPlanInputSchema>;

// Schema for getting lesson plans by filters
export const getLessonPlansInputSchema = z.object({
  subject: subjectEnum.optional(),
  grade: gradeEnum.optional(),
  semester: semesterEnum.optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0)
});

export type GetLessonPlansInput = z.infer<typeof getLessonPlansInputSchema>;

// Schema for getting single lesson plan
export const getLessonPlanInputSchema = z.object({
  id: z.string()
});

export type GetLessonPlanInput = z.infer<typeof getLessonPlanInputSchema>;