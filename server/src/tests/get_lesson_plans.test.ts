import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { lessonPlansTable } from '../db/schema';
import { type GetLessonPlansInput, type LessonPlan } from '../schema';
import { getLessonPlans } from '../handlers/get_lesson_plans';
import { eq } from 'drizzle-orm';

// Test lesson plans data
const createTestLessonPlan = (overrides: Partial<any> = {}) => ({
  id: `lesson-${Date.now()}-${Math.random()}`,
  subject: 'Matematika' as const,
  material: 'Aljabar Linear',
  grade: '10 SMA' as const,
  semester: '1' as const,
  learning_objectives: [
    {
      id: 'lo1',
      description: 'Memahami konsep aljabar',
      indicator: 'Siswa dapat menyelesaikan persamaan linear'
    }
  ],
  teaching_methods: [
    {
      name: 'Ceramah',
      description: 'Penjelasan konsep dasar',
      duration_minutes: 30
    }
  ],
  materials_tools: [
    {
      name: 'Papan tulis',
      type: 'alat' as const,
      description: 'Untuk menulis rumus'
    }
  ],
  learning_activities: [
    {
      step: 1,
      activity: 'Pembukaan',
      duration_minutes: 10,
      description: 'Salam dan absensi'
    }
  ],
  assessments: [
    {
      type: 'formatif' as const,
      method: 'Tanya jawab',
      description: 'Menilai pemahaman siswa',
      criteria: 'Ketepatan jawaban'
    }
  ],
  references: [
    {
      title: 'Matematika SMA',
      author: 'John Doe',
      type: 'buku' as const
    }
  ],
  total_duration_minutes: 90,
  ...overrides
});

describe('getLessonPlans', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should fetch lesson plans with default pagination', async () => {
    // Create test data
    const lessonPlan1 = createTestLessonPlan({ id: 'lesson1' });
    const lessonPlan2 = createTestLessonPlan({ 
      id: 'lesson2', 
      subject: 'IPA',
      material: 'Fisika Dasar' 
    });

    await db.insert(lessonPlansTable).values([lessonPlan1, lessonPlan2]).execute();

    const input: GetLessonPlansInput = {
      limit: 20,
      offset: 0
    };

    const result = await getLessonPlans(input);

    expect(result).toHaveLength(2);
    expect(result[0].subject).toBeDefined();
    expect(result[0].material).toBeDefined();
    expect(result[0].grade).toBeDefined();
    expect(result[0].semester).toBeDefined();
    expect(result[0].learning_objectives).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
  });

  it('should filter by subject', async () => {
    // Create test data with different subjects
    const matematikaLesson = createTestLessonPlan({ 
      id: 'math1', 
      subject: 'Matematika',
      material: 'Aljabar' 
    });
    const ipaLesson = createTestLessonPlan({ 
      id: 'ipa1', 
      subject: 'IPA',
      material: 'Fisika' 
    });

    await db.insert(lessonPlansTable).values([matematikaLesson, ipaLesson]).execute();

    const input: GetLessonPlansInput = {
      subject: 'Matematika',
      limit: 20,
      offset: 0
    };

    const result = await getLessonPlans(input);

    expect(result).toHaveLength(1);
    expect(result[0].subject).toBe('Matematika');
    expect(result[0].material).toBe('Aljabar');
  });

  it('should filter by grade', async () => {
    // Create test data with different grades
    const smaLesson = createTestLessonPlan({ 
      id: 'sma1', 
      grade: '10 SMA',
      material: 'Materi SMA' 
    });
    const smpLesson = createTestLessonPlan({ 
      id: 'smp1', 
      grade: '7 SMP',
      material: 'Materi SMP' 
    });

    await db.insert(lessonPlansTable).values([smaLesson, smpLesson]).execute();

    const input: GetLessonPlansInput = {
      grade: '10 SMA',
      limit: 20,
      offset: 0
    };

    const result = await getLessonPlans(input);

    expect(result).toHaveLength(1);
    expect(result[0].grade).toBe('10 SMA');
    expect(result[0].material).toBe('Materi SMA');
  });

  it('should filter by semester', async () => {
    // Create test data with different semesters
    const semester1Lesson = createTestLessonPlan({ 
      id: 'sem1', 
      semester: '1',
      material: 'Materi Semester 1' 
    });
    const semester2Lesson = createTestLessonPlan({ 
      id: 'sem2', 
      semester: '2',
      material: 'Materi Semester 2' 
    });

    await db.insert(lessonPlansTable).values([semester1Lesson, semester2Lesson]).execute();

    const input: GetLessonPlansInput = {
      semester: '2',
      limit: 20,
      offset: 0
    };

    const result = await getLessonPlans(input);

    expect(result).toHaveLength(1);
    expect(result[0].semester).toBe('2');
    expect(result[0].material).toBe('Materi Semester 2');
  });

  it('should apply multiple filters', async () => {
    // Create test data with various combinations
    const matchingLesson = createTestLessonPlan({ 
      id: 'match1', 
      subject: 'Matematika',
      grade: '10 SMA',
      semester: '1',
      material: 'Matching Lesson' 
    });
    const nonMatchingLesson1 = createTestLessonPlan({ 
      id: 'nomatch1', 
      subject: 'IPA',  // Different subject
      grade: '10 SMA',
      semester: '1',
      material: 'Non-matching Lesson 1' 
    });
    const nonMatchingLesson2 = createTestLessonPlan({ 
      id: 'nomatch2', 
      subject: 'Matematika',
      grade: '11 SMA',  // Different grade
      semester: '1',
      material: 'Non-matching Lesson 2' 
    });

    await db.insert(lessonPlansTable).values([matchingLesson, nonMatchingLesson1, nonMatchingLesson2]).execute();

    const input: GetLessonPlansInput = {
      subject: 'Matematika',
      grade: '10 SMA',
      semester: '1',
      limit: 20,
      offset: 0
    };

    const result = await getLessonPlans(input);

    expect(result).toHaveLength(1);
    expect(result[0].subject).toBe('Matematika');
    expect(result[0].grade).toBe('10 SMA');
    expect(result[0].semester).toBe('1');
    expect(result[0].material).toBe('Matching Lesson');
  });

  it('should handle pagination correctly', async () => {
    // Create multiple test lesson plans
    const lessonPlans = Array.from({ length: 5 }, (_, i) => 
      createTestLessonPlan({ 
        id: `lesson${i + 1}`,
        material: `Material ${i + 1}` 
      })
    );

    await db.insert(lessonPlansTable).values(lessonPlans).execute();

    // Test first page
    const firstPageInput: GetLessonPlansInput = {
      limit: 2,
      offset: 0
    };

    const firstPageResult = await getLessonPlans(firstPageInput);
    expect(firstPageResult).toHaveLength(2);

    // Test second page
    const secondPageInput: GetLessonPlansInput = {
      limit: 2,
      offset: 2
    };

    const secondPageResult = await getLessonPlans(secondPageInput);
    expect(secondPageResult).toHaveLength(2);

    // Ensure different results
    expect(firstPageResult[0].id).not.toBe(secondPageResult[0].id);
  });

  it('should return results ordered by created_at descending', async () => {
    // Create lesson plans with different timestamps by waiting between inserts
    const oldLesson = createTestLessonPlan({ 
      id: 'old1',
      material: 'Old Lesson' 
    });
    
    await db.insert(lessonPlansTable).values([oldLesson]).execute();
    
    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const newLesson = createTestLessonPlan({ 
      id: 'new1',
      material: 'New Lesson' 
    });
    
    await db.insert(lessonPlansTable).values([newLesson]).execute();

    const input: GetLessonPlansInput = {
      limit: 20,
      offset: 0
    };

    const result = await getLessonPlans(input);

    expect(result).toHaveLength(2);
    // Newer lesson should come first (descending order)
    expect(result[0].material).toBe('New Lesson');
    expect(result[1].material).toBe('Old Lesson');
    expect(result[0].created_at >= result[1].created_at).toBe(true);
  });

  it('should return empty array when no lesson plans match filters', async () => {
    // Create a lesson plan that won't match our filter
    const lessonPlan = createTestLessonPlan({ 
      id: 'test1',
      subject: 'Matematika' 
    });

    await db.insert(lessonPlansTable).values([lessonPlan]).execute();

    const input: GetLessonPlansInput = {
      subject: 'IPA', // Filter for different subject
      limit: 20,
      offset: 0
    };

    const result = await getLessonPlans(input);

    expect(result).toHaveLength(0);
  });

  it('should handle empty database', async () => {
    const input: GetLessonPlansInput = {
      limit: 20,
      offset: 0
    };

    const result = await getLessonPlans(input);

    expect(result).toHaveLength(0);
  });

  it('should handle undefined input with defaults', async () => {
    // Create test data
    const lessonPlan = createTestLessonPlan({ id: 'default-test' });
    await db.insert(lessonPlansTable).values([lessonPlan]).execute();

    // Call without input parameter
    const result = await getLessonPlans();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('default-test');
  });

  it('should verify lesson plan structure and types', async () => {
    const lessonPlan = createTestLessonPlan({ id: 'structure-test' });
    await db.insert(lessonPlansTable).values([lessonPlan]).execute();

    const input: GetLessonPlansInput = {
      limit: 20,
      offset: 0
    };

    const result = await getLessonPlans(input);

    expect(result).toHaveLength(1);
    
    const plan = result[0];
    
    // Check all required fields exist and have correct types
    expect(typeof plan.id).toBe('string');
    expect(typeof plan.subject).toBe('string');
    expect(typeof plan.material).toBe('string');
    expect(typeof plan.grade).toBe('string');
    expect(typeof plan.semester).toBe('string');
    expect(typeof plan.total_duration_minutes).toBe('number');
    expect(plan.created_at).toBeInstanceOf(Date);
    expect(plan.updated_at).toBeInstanceOf(Date);
    
    // Check JSONB array fields
    expect(Array.isArray(plan.learning_objectives)).toBe(true);
    expect(Array.isArray(plan.teaching_methods)).toBe(true);
    expect(Array.isArray(plan.materials_tools)).toBe(true);
    expect(Array.isArray(plan.learning_activities)).toBe(true);
    expect(Array.isArray(plan.assessments)).toBe(true);
    expect(Array.isArray(plan.references)).toBe(true);
    
    // Check content of arrays
    expect(plan.learning_objectives[0]).toHaveProperty('id');
    expect(plan.learning_objectives[0]).toHaveProperty('description');
    expect(plan.learning_objectives[0]).toHaveProperty('indicator');
    
    expect(plan.teaching_methods[0]).toHaveProperty('name');
    expect(plan.teaching_methods[0]).toHaveProperty('description');
    expect(plan.teaching_methods[0]).toHaveProperty('duration_minutes');
  });
});