import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { lessonPlansTable } from '../db/schema';
import { type GetLessonPlanInput } from '../schema';
import { deleteLessonPlan } from '../handlers/delete_lesson_plan';
import { eq } from 'drizzle-orm';

// Test lesson plan data
const testLessonPlan = {
  id: 'test-lesson-plan-001',
  subject: 'Matematika' as const,
  material: 'Aljabar Dasar',
  grade: '7 SMP' as const,
  semester: '1' as const,
  learning_objectives: [
    {
      id: 'lo1',
      description: 'Memahami konsep aljabar',
      indicator: 'Dapat menyelesaikan persamaan linear'
    }
  ],
  teaching_methods: [
    {
      name: 'Diskusi Kelompok',
      description: 'Diskusi tentang penerapan aljabar',
      duration_minutes: 30
    }
  ],
  materials_tools: [
    {
      name: 'Papan Tulis',
      type: 'alat' as const,
      description: 'Untuk menjelaskan konsep'
    }
  ],
  learning_activities: [
    {
      step: 1,
      activity: 'Pembukaan',
      duration_minutes: 10,
      description: 'Salam dan apersepsi'
    }
  ],
  assessments: [
    {
      type: 'formatif' as const,
      method: 'Observasi',
      description: 'Mengamati partisipasi siswa',
      criteria: 'Keaktifan dalam diskusi'
    }
  ],
  references: [
    {
      title: 'Buku Matematika SMP Kelas 7',
      author: 'Tim Penulis',
      type: 'buku' as const
    }
  ],
  total_duration_minutes: 80
};

const testInput: GetLessonPlanInput = {
  id: 'test-lesson-plan-001'
};

describe('deleteLessonPlan', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing lesson plan', async () => {
    // Create a lesson plan first
    await db.insert(lessonPlansTable)
      .values(testLessonPlan)
      .execute();

    // Verify it exists
    const beforeDelete = await db.select()
      .from(lessonPlansTable)
      .where(eq(lessonPlansTable.id, testInput.id))
      .execute();

    expect(beforeDelete).toHaveLength(1);

    // Delete the lesson plan
    const result = await deleteLessonPlan(testInput);

    expect(result).toBe(true);

    // Verify it's deleted
    const afterDelete = await db.select()
      .from(lessonPlansTable)
      .where(eq(lessonPlansTable.id, testInput.id))
      .execute();

    expect(afterDelete).toHaveLength(0);
  });

  it('should return false when trying to delete non-existent lesson plan', async () => {
    const nonExistentInput: GetLessonPlanInput = {
      id: 'non-existent-id'
    };

    const result = await deleteLessonPlan(nonExistentInput);

    expect(result).toBe(false);
  });

  it('should not affect other lesson plans when deleting one', async () => {
    // Create two lesson plans
    const secondLessonPlan = {
      ...testLessonPlan,
      id: 'test-lesson-plan-002',
      material: 'Geometri Dasar'
    };

    await db.insert(lessonPlansTable)
      .values([testLessonPlan, secondLessonPlan])
      .execute();

    // Verify both exist
    const beforeDelete = await db.select()
      .from(lessonPlansTable)
      .execute();

    expect(beforeDelete).toHaveLength(2);

    // Delete only the first lesson plan
    const result = await deleteLessonPlan(testInput);

    expect(result).toBe(true);

    // Verify only one remains
    const afterDelete = await db.select()
      .from(lessonPlansTable)
      .execute();

    expect(afterDelete).toHaveLength(1);
    expect(afterDelete[0].id).toBe('test-lesson-plan-002');
    expect(afterDelete[0].material).toBe('Geometri Dasar');
  });

  it('should handle empty string id correctly', async () => {
    const emptyIdInput: GetLessonPlanInput = {
      id: ''
    };

    const result = await deleteLessonPlan(emptyIdInput);

    expect(result).toBe(false);
  });

  it('should verify lesson plan structure before deletion', async () => {
    // Create a lesson plan with all required fields
    await db.insert(lessonPlansTable)
      .values(testLessonPlan)
      .execute();

    // Verify the structure exists in database
    const existing = await db.select()
      .from(lessonPlansTable)
      .where(eq(lessonPlansTable.id, testInput.id))
      .execute();

    expect(existing[0].subject).toBe('Matematika');
    expect(existing[0].material).toBe('Aljabar Dasar');
    expect(existing[0].grade).toBe('7 SMP');
    expect(existing[0].semester).toBe('1');
    expect(existing[0].learning_objectives).toEqual(testLessonPlan.learning_objectives);
    expect(existing[0].total_duration_minutes).toBe(80);

    // Now delete it
    const result = await deleteLessonPlan(testInput);

    expect(result).toBe(true);
  });
});