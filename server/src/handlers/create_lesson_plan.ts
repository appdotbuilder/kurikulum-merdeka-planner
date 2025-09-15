import { db } from '../db';
import { lessonPlansTable } from '../db/schema';
import { type CreateLessonPlanInput, type LessonPlan } from '../schema';
import { randomUUID } from 'crypto';

export const createLessonPlan = async (input: CreateLessonPlanInput): Promise<LessonPlan> => {
  try {
    const lessonPlanId = randomUUID();
    
    // Generate comprehensive lesson plan content based on Kurikulum Merdeka
    const learningObjectives = generateLearningObjectives(input);
    const teachingMethods = generateTeachingMethods(input);
    const materialsTools = generateMaterialsTools(input);
    const learningActivities = generateLearningActivities(input);
    const assessments = generateAssessments(input);
    const references = generateReferences(input);
    
    // Calculate total duration from activities and methods
    const totalDuration = calculateTotalDuration(learningActivities, teachingMethods);
    
    // Insert lesson plan record
    const result = await db.insert(lessonPlansTable)
      .values({
        id: lessonPlanId,
        subject: input.subject,
        material: input.material,
        grade: input.grade,
        semester: input.semester,
        learning_objectives: learningObjectives,
        teaching_methods: teachingMethods,
        materials_tools: materialsTools,
        learning_activities: learningActivities,
        assessments: assessments,
        references: references,
        total_duration_minutes: totalDuration
      })
      .returning()
      .execute();

    const lessonPlan = result[0];
    
    // JSONB fields are already parsed by Drizzle ORM
    return {
      id: lessonPlan.id,
      subject: lessonPlan.subject,
      material: lessonPlan.material,
      grade: lessonPlan.grade,
      semester: lessonPlan.semester,
      learning_objectives: lessonPlan.learning_objectives as any,
      teaching_methods: lessonPlan.teaching_methods as any,
      materials_tools: lessonPlan.materials_tools as any,
      learning_activities: lessonPlan.learning_activities as any,
      assessments: lessonPlan.assessments as any,
      references: lessonPlan.references as any,
      total_duration_minutes: lessonPlan.total_duration_minutes,
      created_at: lessonPlan.created_at,
      updated_at: lessonPlan.updated_at
    };
  } catch (error) {
    console.error('Lesson plan creation failed:', error);
    throw error;
  }
};

function generateLearningObjectives(input: CreateLessonPlanInput) {
  const gradeLevel = input.grade.includes('SD') ? 'SD' : 
                   input.grade.includes('SMP') ? 'SMP' : 'SMA/SMK';
  
  return [
    {
      id: `obj-${randomUUID()}`,
      description: `Peserta didik mampu memahami konsep dasar ${input.material} sesuai dengan tingkat ${gradeLevel}`,
      indicator: `Dapat menjelaskan definisi, karakteristik, dan penerapan ${input.material} dalam kehidupan sehari-hari`
    },
    {
      id: `obj-${randomUUID()}`,
      description: `Peserta didik mampu menganalisis dan menerapkan pengetahuan ${input.material}`,
      indicator: `Mampu mengidentifikasi masalah dan memberikan solusi terkait ${input.material}`
    },
    {
      id: `obj-${randomUUID()}`,
      description: `Peserta didik menunjukkan sikap kritis dan kreatif dalam pembelajaran ${input.material}`,
      indicator: `Aktif berpartisipasi dalam diskusi dan mampu mengajukan pertanyaan yang relevan`
    }
  ];
}

function generateTeachingMethods(input: CreateLessonPlanInput) {
  const isElementary = input.grade.includes('SD');
  
  const methods = [
    {
      name: 'Ceramah Interaktif',
      description: 'Penyampaian materi dengan melibatkan partisipasi aktif siswa',
      duration_minutes: 20
    },
    {
      name: isElementary ? 'Bermain Peran' : 'Diskusi Kelompok',
      description: isElementary ? 
        'Pembelajaran melalui permainan dan simulasi yang menyenangkan' :
        'Pembelajaran kolaboratif melalui diskusi kelompok kecil',
      duration_minutes: 30
    },
    {
      name: 'Demonstrasi',
      description: `Peragaan langsung terkait konsep ${input.material}`,
      duration_minutes: 15
    }
  ];
  
  return methods;
}

function generateMaterialsTools(input: CreateLessonPlanInput) {
  const isElementary = input.grade.includes('SD');
  
  return [
    {
      name: `Buku Teks ${input.subject}`,
      type: 'bahan' as const,
      description: `Buku panduan resmi ${input.subject} untuk ${input.grade} semester ${input.semester}`
    },
    {
      name: 'Papan Tulis/Whiteboard',
      type: 'alat' as const,
      description: 'Media untuk menjelaskan konsep dan mencatat poin penting'
    },
    {
      name: isElementary ? 'Alat Peraga' : 'Laptop/Proyektor',
      type: 'alat' as const,
      description: isElementary ? 
        'Alat bantu visual untuk memudahkan pemahaman siswa' :
        'Perangkat presentasi untuk mendukung pembelajaran digital'
    },
    {
      name: 'Lembar Kerja Siswa (LKS)',
      type: 'bahan' as const,
      description: 'Worksheet untuk latihan dan evaluasi pemahaman siswa'
    }
  ];
}

function generateLearningActivities(input: CreateLessonPlanInput) {
  return [
    {
      step: 1,
      activity: 'Pendahuluan',
      duration_minutes: 10,
      description: 'Salam pembuka, presensi, apersepsi menghubungkan materi sebelumnya dengan materi baru, dan penyampaian tujuan pembelajaran'
    },
    {
      step: 2,
      activity: 'Eksplorasi',
      duration_minutes: 15,
      description: `Siswa mengamati dan mengidentifikasi fenomena atau contoh terkait ${input.material} dalam kehidupan sehari-hari`
    },
    {
      step: 3,
      activity: 'Elaborasi',
      duration_minutes: 30,
      description: `Penjelasan konsep ${input.material} melalui ceramah interaktif, diskusi, dan demonstrasi praktis`
    },
    {
      step: 4,
      activity: 'Konfirmasi dan Latihan',
      duration_minutes: 20,
      description: 'Siswa mengerjakan latihan soal dan melakukan refleksi terhadap pemahaman materi yang telah dipelajari'
    },
    {
      step: 5,
      activity: 'Penutup',
      duration_minutes: 5,
      description: 'Kesimpulan pembelajaran, evaluasi singkat, dan penyampaian rencana pembelajaran selanjutnya'
    }
  ];
}

function generateAssessments(input: CreateLessonPlanInput) {
  return [
    {
      type: 'formatif' as const,
      method: 'Observasi',
      description: 'Pengamatan keaktifan dan partisipasi siswa selama proses pembelajaran berlangsung',
      criteria: 'Keaktifan bertanya, menjawab, dan berpartisipasi dalam diskusi kelompok'
    },
    {
      type: 'formatif' as const,
      method: 'Tanya Jawab',
      description: 'Evaluasi pemahaman siswa melalui pertanyaan lisan selama pembelajaran',
      criteria: 'Ketepatan dan kualitas jawaban yang diberikan siswa'
    },
    {
      type: 'sumatif' as const,
      method: 'Tes Tertulis',
      description: 'Evaluasi pemahaman komprehensif siswa melalui soal pilihan ganda dan essay',
      criteria: 'Ketepatan jawaban dan kemampuan menganalisis konsep yang telah dipelajari'
    },
    {
      type: 'sumatif' as const,
      method: 'Tugas Mandiri',
      description: `Penugasan individu berupa analisis kasus atau pembuatan karya terkait ${input.material}`,
      criteria: 'Kreativitas, kesesuaian dengan materi, dan ketepatan waktu pengumpulan'
    }
  ];
}

function generateReferences(input: CreateLessonPlanInput) {
  return [
    {
      title: `Buku ${input.subject} Kelas ${input.grade}`,
      author: 'Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi',
      type: 'buku' as const
    },
    {
      title: 'Kurikulum Merdeka - Panduan Pembelajaran',
      author: 'Kemendikbudristek',
      url: 'https://kurikulum.kemdikbud.go.id',
      type: 'website' as const
    },
    {
      title: `Video Pembelajaran ${input.material}`,
      author: 'Portal Rumah Belajar Kemendikbud',
      url: 'https://belajar.kemdikbud.go.id',
      type: 'video' as const
    },
    {
      title: `Artikel: Strategi Pembelajaran ${input.subject} di Era Digital`,
      author: 'Jurnal Pendidikan Indonesia',
      type: 'artikel' as const
    }
  ];
}

function calculateTotalDuration(activities: any[], methods: any[]) {
  const activitiesDuration = activities.reduce((total, activity) => total + activity.duration_minutes, 0);
  const methodsDuration = methods.reduce((total, method) => total + method.duration_minutes, 0);
  
  // Use the maximum of activities duration or methods duration, as they may overlap
  return Math.max(activitiesDuration, methodsDuration);
}