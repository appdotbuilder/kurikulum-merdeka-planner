import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { lessonPlansTable } from '../db/schema';
import { type UpdateLessonPlanInput, type CreateLessonPlanInput } from '../schema';
import { updateLessonPlan } from '../handlers/update_lesson_plan';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

// Helper to create a lesson plan for testing
const createTestLessonPlan = async () => {
  const testPlan = {
    id: randomUUID(),
    subject: 'Matematika' as const,
    material: 'Aljabar Dasar',
    grade: '7 SMP' as const,
    semester: '1' as const,
    learning_objectives: [
      {
        id: randomUUID(),
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
        description: 'Untuk menjelaskan materi'
      }
    ],
    learning_activities: [
      {
        step: 1,
        activity: 'Pembukaan',
        duration_minutes: 10,
        description: 'Salam dan doa'
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
        title: 'Buku Matematika SMP',
        author: 'Penulis Test',
        type: 'buku' as const
      }
    ],
    total_duration_minutes: 90,
    created_at: new Date(),
    updated_at: new Date()
  };

  await db.insert(lessonPlansTable).values(testPlan).execute();
  return testPlan;
};

describe('updateLessonPlan', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update basic lesson plan fields', async () => {
    const testPlan = await createTestLessonPlan();
    
    const updateInput: UpdateLessonPlanInput = {
      id: testPlan.id,
      subject: 'Fisika',
      material: 'Gerak Lurus',
      grade: '10 SMA',
      semester: '2',
      total_duration_minutes: 120
    };

    const result = await updateLessonPlan(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(testPlan.id);
    expect(result!.subject).toEqual('Fisika');
    expect(result!.material).toEqual('Gerak Lurus');
    expect(result!.grade).toEqual('10 SMA');
    expect(result!.semester).toEqual('2');
    expect(result!.total_duration_minutes).toEqual(120);
    expect(result!.updated_at).toBeInstanceOf(Date);
    expect(result!.updated_at.getTime()).toBeGreaterThan(testPlan.updated_at.getTime());
  });

  it('should update complex array fields', async () => {
    const testPlan = await createTestLessonPlan();
    
    const newObjectives = [
      {
        id: randomUUID(),
        description: 'Memahami konsep fisika',
        indicator: 'Siswa dapat menghitung kecepatan'
      },
      {
        id: randomUUID(),
        description: 'Menerapkan rumus gerak',
        indicator: 'Siswa dapat menyelesaikan soal gerak'
      }
    ];

    const newMethods = [
      {
        name: 'Demonstrasi',
        description: 'Praktik langsung',
        duration_minutes: 45
      }
    ];

    const updateInput: UpdateLessonPlanInput = {
      id: testPlan.id,
      learning_objectives: newObjectives,
      teaching_methods: newMethods
    };

    const result = await updateLessonPlan(updateInput);

    expect(result).not.toBeNull();
    expect(result!.learning_objectives).toEqual(newObjectives);
    expect(result!.teaching_methods).toEqual(newMethods);
    // Should preserve other fields
    expect(result!.subject).toEqual(testPlan.subject);
    expect(result!.material).toEqual(testPlan.material);
  });

  it('should update materials and tools', async () => {
    const testPlan = await createTestLessonPlan();
    
    const newMaterials = [
      {
        name: 'Laboratorium',
        type: 'alat' as const,
        description: 'Ruang praktikum'
      },
      {
        name: 'Bola',
        type: 'bahan' as const,
        description: 'Untuk demonstrasi gerak'
      }
    ];

    const updateInput: UpdateLessonPlanInput = {
      id: testPlan.id,
      materials_tools: newMaterials
    };

    const result = await updateLessonPlan(updateInput);

    expect(result).not.toBeNull();
    expect(result!.materials_tools).toEqual(newMaterials);
  });

  it('should update learning activities', async () => {
    const testPlan = await createTestLessonPlan();
    
    const newActivities = [
      {
        step: 1,
        activity: 'Pembukaan',
        duration_minutes: 10,
        description: 'Salam dan apersepsi'
      },
      {
        step: 2,
        activity: 'Kegiatan Inti',
        duration_minutes: 60,
        description: 'Penjelasan materi dan praktik'
      },
      {
        step: 3,
        activity: 'Penutup',
        duration_minutes: 10,
        description: 'Kesimpulan dan evaluasi'
      }
    ];

    const updateInput: UpdateLessonPlanInput = {
      id: testPlan.id,
      learning_activities: newActivities
    };

    const result = await updateLessonPlan(updateInput);

    expect(result).not.toBeNull();
    expect(result!.learning_activities).toEqual(newActivities);
  });

  it('should update assessments and references', async () => {
    const testPlan = await createTestLessonPlan();
    
    const newAssessments = [
      {
        type: 'formatif' as const,
        method: 'Observasi',
        description: 'Mengamati kegiatan siswa',
        criteria: 'Keaktifan dan partisipasi'
      },
      {
        type: 'sumatif' as const,
        method: 'Tes tulis',
        description: 'Ujian akhir bab',
        criteria: 'Ketepatan jawaban dan pemahaman konsep'
      }
    ];

    const newReferences = [
      {
        title: 'Fisika untuk SMA',
        author: 'Dr. Fisika',
        type: 'buku' as const
      },
      {
        title: 'Video Gerak Lurus',
        url: 'https://example.com/video',
        type: 'video' as const
      }
    ];

    const updateInput: UpdateLessonPlanInput = {
      id: testPlan.id,
      assessments: newAssessments,
      references: newReferences
    };

    const result = await updateLessonPlan(updateInput);

    expect(result).not.toBeNull();
    expect(result!.assessments).toEqual(newAssessments);
    expect(result!.references).toEqual(newReferences);
  });

  it('should update only provided fields', async () => {
    const testPlan = await createTestLessonPlan();
    const originalUpdatedAt = testPlan.updated_at;
    
    const updateInput: UpdateLessonPlanInput = {
      id: testPlan.id,
      material: 'Updated Material Only'
    };

    const result = await updateLessonPlan(updateInput);

    expect(result).not.toBeNull();
    expect(result!.material).toEqual('Updated Material Only');
    // Other fields should remain unchanged
    expect(result!.subject).toEqual(testPlan.subject);
    expect(result!.grade).toEqual(testPlan.grade);
    expect(result!.semester).toEqual(testPlan.semester);
    expect(result!.total_duration_minutes).toEqual(testPlan.total_duration_minutes);
    // But updated_at should be changed
    expect(result!.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });

  it('should return null for non-existent lesson plan', async () => {
    const nonExistentId = randomUUID();
    
    const updateInput: UpdateLessonPlanInput = {
      id: nonExistentId,
      material: 'This should not work'
    };

    const result = await updateLessonPlan(updateInput);

    expect(result).toBeNull();
  });

  it('should save updates to database', async () => {
    const testPlan = await createTestLessonPlan();
    
    const updateInput: UpdateLessonPlanInput = {
      id: testPlan.id,
      subject: 'Kimia',
      material: 'Ikatan Kimia',
      total_duration_minutes: 150
    };

    await updateLessonPlan(updateInput);

    // Verify changes were saved to database
    const savedPlan = await db.select()
      .from(lessonPlansTable)
      .where(eq(lessonPlansTable.id, testPlan.id))
      .execute();

    expect(savedPlan).toHaveLength(1);
    expect(savedPlan[0].subject).toEqual('Kimia');
    expect(savedPlan[0].material).toEqual('Ikatan Kimia');
    expect(savedPlan[0].total_duration_minutes).toEqual(150);
    expect(savedPlan[0].updated_at).toBeInstanceOf(Date);
    expect(savedPlan[0].updated_at.getTime()).toBeGreaterThan(testPlan.updated_at.getTime());
  });

  it('should preserve created_at timestamp', async () => {
    const testPlan = await createTestLessonPlan();
    const originalCreatedAt = testPlan.created_at;
    
    const updateInput: UpdateLessonPlanInput = {
      id: testPlan.id,
      material: 'Updated Material'
    };

    const result = await updateLessonPlan(updateInput);

    expect(result).not.toBeNull();
    expect(result!.created_at).toEqual(originalCreatedAt);
    expect(result!.updated_at.getTime()).toBeGreaterThan(originalCreatedAt.getTime());
  });
});