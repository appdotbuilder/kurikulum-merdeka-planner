import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { lessonPlansTable } from '../db/schema';
import { type GetLessonPlanInput } from '../schema';
import { getLessonPlan } from '../handlers/get_lesson_plan';
import { eq } from 'drizzle-orm';

// Test data
const testLessonPlan = {
  id: 'lesson-plan-123',
  subject: 'Matematika' as const,
  material: 'Aljabar Linear',
  grade: '10 SMA' as const,
  semester: '1' as const,
  learning_objectives: [
    {
      id: 'obj-1',
      description: 'Memahami konsep aljabar linear',
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
      description: 'Salam dan presensi'
    }
  ],
  assessments: [
    {
      type: 'formatif' as const,
      method: 'Tanya jawab',
      description: 'Pertanyaan lisan',
      criteria: 'Ketepatan jawaban'
    }
  ],
  references: [
    {
      title: 'Matematika SMA Kelas 10',
      author: 'Dr. Ahmad',
      type: 'buku' as const
    }
  ],
  total_duration_minutes: 90
};

const testInput: GetLessonPlanInput = {
  id: 'lesson-plan-123'
};

describe('getLessonPlan', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return lesson plan when found', async () => {
    // Insert test lesson plan
    await db.insert(lessonPlansTable)
      .values({
        ...testLessonPlan,
        learning_objectives: testLessonPlan.learning_objectives,
        teaching_methods: testLessonPlan.teaching_methods,
        materials_tools: testLessonPlan.materials_tools,
        learning_activities: testLessonPlan.learning_activities,
        assessments: testLessonPlan.assessments,
        references: testLessonPlan.references
      })
      .execute();

    const result = await getLessonPlan(testInput);

    // Verify the lesson plan is returned correctly
    expect(result).not.toBeNull();
    expect(result!.id).toEqual('lesson-plan-123');
    expect(result!.subject).toEqual('Matematika');
    expect(result!.material).toEqual('Aljabar Linear');
    expect(result!.grade).toEqual('10 SMA');
    expect(result!.semester).toEqual('1');
    expect(result!.total_duration_minutes).toEqual(90);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);

    // Verify JSON arrays are properly parsed
    expect(Array.isArray(result!.learning_objectives)).toBe(true);
    expect(result!.learning_objectives).toHaveLength(1);
    expect(result!.learning_objectives[0].id).toEqual('obj-1');
    expect(result!.learning_objectives[0].description).toEqual('Memahami konsep aljabar linear');

    expect(Array.isArray(result!.teaching_methods)).toBe(true);
    expect(result!.teaching_methods).toHaveLength(1);
    expect(result!.teaching_methods[0].name).toEqual('Ceramah');
    expect(result!.teaching_methods[0].duration_minutes).toEqual(30);

    expect(Array.isArray(result!.materials_tools)).toBe(true);
    expect(result!.materials_tools).toHaveLength(1);
    expect(result!.materials_tools[0].name).toEqual('Papan tulis');
    expect(result!.materials_tools[0].type).toEqual('alat');

    expect(Array.isArray(result!.learning_activities)).toBe(true);
    expect(result!.learning_activities).toHaveLength(1);
    expect(result!.learning_activities[0].step).toEqual(1);
    expect(result!.learning_activities[0].activity).toEqual('Pembukaan');

    expect(Array.isArray(result!.assessments)).toBe(true);
    expect(result!.assessments).toHaveLength(1);
    expect(result!.assessments[0].type).toEqual('formatif');
    expect(result!.assessments[0].method).toEqual('Tanya jawab');

    expect(Array.isArray(result!.references)).toBe(true);
    expect(result!.references).toHaveLength(1);
    expect(result!.references[0].title).toEqual('Matematika SMA Kelas 10');
    expect(result!.references[0].type).toEqual('buku');
  });

  it('should return null when lesson plan not found', async () => {
    const nonExistentInput: GetLessonPlanInput = {
      id: 'non-existent-id'
    };

    const result = await getLessonPlan(nonExistentInput);

    expect(result).toBeNull();
  });

  it('should handle empty arrays in JSON fields', async () => {
    const lessonPlanWithEmptyArrays = {
      ...testLessonPlan,
      id: 'lesson-plan-empty-arrays',
      learning_objectives: [],
      teaching_methods: [],
      materials_tools: [],
      learning_activities: [],
      assessments: [],
      references: []
    };

    // Insert test lesson plan with empty arrays
    await db.insert(lessonPlansTable)
      .values({
        ...lessonPlanWithEmptyArrays,
        learning_objectives: lessonPlanWithEmptyArrays.learning_objectives,
        teaching_methods: lessonPlanWithEmptyArrays.teaching_methods,
        materials_tools: lessonPlanWithEmptyArrays.materials_tools,
        learning_activities: lessonPlanWithEmptyArrays.learning_activities,
        assessments: lessonPlanWithEmptyArrays.assessments,
        references: lessonPlanWithEmptyArrays.references
      })
      .execute();

    const emptyArraysInput: GetLessonPlanInput = {
      id: 'lesson-plan-empty-arrays'
    };

    const result = await getLessonPlan(emptyArraysInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual('lesson-plan-empty-arrays');
    expect(result!.learning_objectives).toEqual([]);
    expect(result!.teaching_methods).toEqual([]);
    expect(result!.materials_tools).toEqual([]);
    expect(result!.learning_activities).toEqual([]);
    expect(result!.assessments).toEqual([]);
    expect(result!.references).toEqual([]);
  });

  it('should fetch lesson plan with different subject and grade', async () => {
    const scienceLessonPlan = {
      ...testLessonPlan,
      id: 'science-lesson-123',
      subject: 'IPA' as const,
      material: 'Sistem Tata Surya',
      grade: '7 SMP' as const,
      semester: '2' as const,
      learning_objectives: [
        {
          id: 'science-obj-1',
          description: 'Memahami sistem tata surya',
          indicator: 'Siswa dapat menyebutkan planet-planet'
        }
      ]
    };

    // Insert science lesson plan
    await db.insert(lessonPlansTable)
      .values({
        ...scienceLessonPlan,
        learning_objectives: scienceLessonPlan.learning_objectives,
        teaching_methods: testLessonPlan.teaching_methods,
        materials_tools: testLessonPlan.materials_tools,
        learning_activities: testLessonPlan.learning_activities,
        assessments: testLessonPlan.assessments,
        references: testLessonPlan.references
      })
      .execute();

    const scienceInput: GetLessonPlanInput = {
      id: 'science-lesson-123'
    };

    const result = await getLessonPlan(scienceInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual('science-lesson-123');
    expect(result!.subject).toEqual('IPA');
    expect(result!.material).toEqual('Sistem Tata Surya');
    expect(result!.grade).toEqual('7 SMP');
    expect(result!.semester).toEqual('2');
    expect(result!.learning_objectives[0].description).toEqual('Memahami sistem tata surya');
  });

  it('should retrieve lesson plan from database correctly', async () => {
    // Insert test lesson plan
    await db.insert(lessonPlansTable)
      .values({
        ...testLessonPlan,
        learning_objectives: testLessonPlan.learning_objectives,
        teaching_methods: testLessonPlan.teaching_methods,
        materials_tools: testLessonPlan.materials_tools,
        learning_activities: testLessonPlan.learning_activities,
        assessments: testLessonPlan.assessments,
        references: testLessonPlan.references
      })
      .execute();

    // Fetch using handler
    const result = await getLessonPlan(testInput);

    // Verify data integrity by querying database directly
    const dbResult = await db.select()
      .from(lessonPlansTable)
      .where(eq(lessonPlansTable.id, 'lesson-plan-123'))
      .execute();

    expect(dbResult).toHaveLength(1);
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(dbResult[0].id);
    expect(result!.subject).toEqual(dbResult[0].subject);
    expect(result!.material).toEqual(dbResult[0].material);
    expect(result!.total_duration_minutes).toEqual(dbResult[0].total_duration_minutes);
  });
});