// Firebase Firestore Storage Layer - Simplified Version
import { db, COLLECTIONS } from "./firebase-db";
import { Timestamp } from "firebase/firestore";

// Type definitions
export interface FirebaseUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  password: string | null;
  profileImageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FirebaseStudentProfile {
  id: string;
  userId: string;
  studentId: string | null;
  trainingId: string | null;
  phone: string | null;
  major: string | null;
  role: string;
  bio: string | null;
  skills: string[];
  languages: { name: string; level: string }[];
  linkedIn: string | null;
  github: string | null;
  interests: string[];
  careerGoals: string | null;
  profileImageUrl: string | null;
  createdAt: Date;
}

export interface FirebaseActivity {
  id: string;
  userId: string;
  type: string;
  nameAr: string;
  nameEn: string | null;
  organization: string;
  hours: number;
  startDate: Date;
  endDate: Date | null;
  descriptionAr: string | null;
  descriptionEn: string | null;
  proofUrl: string | null;
  certificateUrl: string | null;
  status: string;
  rejectionReason: string | null;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
}

export interface FirebaseCourse {
  id: string;
  titleAr: string;
  titleEn: string | null;
  descriptionAr: string | null;
  descriptionEn: string | null;
  category: string;
  duration: number;
  instructorId: string | null;
  imageUrl: string | null;
  isPublished: boolean;
  createdAt: Date;
}

export interface FirebaseCourseLesson {
  id: string;
  courseId: string;
  titleAr: string;
  titleEn: string | null;
  contentAr: string | null;
  contentEn: string | null;
  videoUrl: string | null;
  orderIndex: number;
  durationMinutes: number;
  createdAt: Date;
}

export interface FirebaseCourseQuiz {
  id: string;
  courseId: string;
  titleAr: string;
  titleEn: string | null;
  type: string;
  passingScore: number;
  orderIndex: number;
  createdAt: Date;
}

export interface FirebaseQuizQuestion {
  id: string;
  quizId: string;
  questionAr: string;
  questionEn: string | null;
  options: { textAr: string; textEn: string | null }[];
  correctAnswer: number;
  orderIndex: number;
}

export interface FirebaseQuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  passed: boolean;
  answers: number[] | null;
  completedAt: Date;
}

export interface FirebaseCourseEnrollment {
  id: string;
  userId: string;
  courseId: string;
  progress: number;
  completedLessons: string[];
  isCompleted: boolean;
  completedAt: Date | null;
  createdAt: Date;
}

export interface FirebaseCertificate {
  id: string;
  userId: string;
  courseId: string | null;
  activityId: string | null;
  type: string;
  titleAr: string;
  titleEn: string | null;
  certificateNumber: number | null;
  issuedAt: Date;
  verificationCode: string;
}

export interface FirebaseLessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  completed: boolean;
  completedAt: Date | null;
}

export interface FirebaseAuditLog {
  id: string;
  actorUserId: string;
  action: string;
  entityType: string;
  entityId: string | null;
  details: string | null;
  createdAt: Date;
}

// Helper functions
function toTimestamp(date: Date | null | undefined): any {
  if (!date) return null;
  return Timestamp.fromDate(date);
}

function fromTimestamp(timestamp: any): Date {
  if (!timestamp) return new Date();
  if (timestamp.toDate) return timestamp.toDate();
  return new Date(date);
}

// Storage class
export class FirebaseStorage {
  // User methods
  async getUser(id: string): Promise<FirebaseUser | null> {
    const doc = await db.collection(COLLECTIONS.USERS).doc(id).get();
    if (!doc.exists) return null;
    const data = doc.data()!;
    return {
      id: doc.id,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      password: data.password,
      profileImageUrl: data.profileImageUrl,
      createdAt: fromTimestamp(data.createdAt),
      updatedAt: fromTimestamp(data.updatedAt),
    };
  }

  async getUserByEmail(email: string): Promise<FirebaseUser | null> {
    const snapshot = await db.collection(COLLECTIONS.USERS).where("email", "==", email).limit(1).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      password: data.password,
      profileImageUrl: data.profileImageUrl,
      createdAt: fromTimestamp(data.createdAt),
      updatedAt: fromTimestamp(data.updatedAt),
    };
  }

  async createUser(user: Omit<FirebaseUser, "id">): Promise<FirebaseUser> {
    const docRef = db.collection(COLLECTIONS.USERS).doc();
    const newUser: FirebaseUser = { ...user, id: docRef.id };
    await docRef.set({
      ...user,
      createdAt: toTimestamp(user.createdAt),
      updatedAt: toTimestamp(user.updatedAt),
    });
    return newUser;
  }

  async updateUser(id: string, data: Partial<FirebaseUser>): Promise<void> {
    const updateData: any = { ...data };
    if (data.updatedAt) updateData.updatedAt = toTimestamp(data.updatedAt);
    await db.collection(COLLECTIONS.USERS).doc(id).update(updateData);
  }

  async getAllUsers(): Promise<FirebaseUser[]> {
    const snapshot = await db.collection(COLLECTIONS.USERS).get();
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
        profileImageUrl: data.profileImageUrl,
        createdAt: fromTimestamp(data.createdAt),
        updatedAt: fromTimestamp(data.updatedAt),
      };
    });
  }

  // Student Profile methods
  async getStudentProfile(userId: string): Promise<FirebaseStudentProfile | null> {
    const snapshot = await db.collection(COLLECTIONS.STUDENT_PROFILES).where("userId", "==", userId).limit(1).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId,
      studentId: data.studentId,
      trainingId: data.trainingId,
      phone: data.phone,
      major: data.major,
      role: data.role || "student",
      bio: data.bio,
      skills: data.skills || [],
      languages: data.languages || [],
      linkedIn: data.linkedIn,
      github: data.github,
      interests: data.interests || [],
      careerGoals: data.careerGoals,
      profileImageUrl: data.profileImageUrl,
      createdAt: fromTimestamp(data.createdAt),
    };
  }

  async upsertStudentProfile(profile: Partial<FirebaseStudentProfile> & { userId: string }): Promise<FirebaseStudentProfile> {
    const existing = await this.getStudentProfile(profile.userId);
    if (existing) {
      await db.collection(COLLECTIONS.STUDENT_PROFILES).doc(existing.id).update(profile);
      return { ...existing, ...profile };
    } else {
      const docRef = db.collection(COLLECTIONS.STUDENT_PROFILES).doc();
      const newProfile: FirebaseStudentProfile = {
        id: docRef.id,
        userId: profile.userId,
        studentId: profile.studentId || null,
        trainingId: profile.trainingId || null,
        phone: profile.phone || null,
        major: profile.major || null,
        role: profile.role || "student",
        bio: profile.bio || null,
        skills: profile.skills || [],
        languages: profile.languages || [],
        linkedIn: profile.linkedIn || null,
        github: profile.github || null,
        interests: profile.interests || [],
        careerGoals: profile.careerGoals || null,
        profileImageUrl: profile.profileImageUrl || null,
        createdAt: new Date(),
      };
      await docRef.set(newProfile);
      return newProfile;
    }
  }

  async getAllStudentProfiles(): Promise<FirebaseStudentProfile[]> {
    const snapshot = await db.collection(COLLECTIONS.STUDENT_PROFILES).get();
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        studentId: data.studentId,
        trainingId: data.trainingId,
        phone: data.phone,
        major: data.major,
        role: data.role || "student",
        bio: data.bio,
        skills: data.skills || [],
        languages: data.languages || [],
        linkedIn: data.linkedIn,
        github: data.github,
        interests: data.interests || [],
        careerGoals: data.careerGoals,
        profileImageUrl: data.profileImageUrl,
        createdAt: fromTimestamp(data.createdAt),
      };
    });
  }

  async getAllUsersWithProfiles(): Promise<(FirebaseUser & { profile?: FirebaseStudentProfile })[]> {
    const users = await this.getAllUsers();
    const profiles = await this.getAllStudentProfiles();
    
    return users.map(user => ({
      ...user,
      profile: profiles.find(p => p.userId === user.id)
    }));
  }

  async updateUserRole(userId: string, role: string): Promise<FirebaseStudentProfile> {
    const profile = await this.getStudentProfile(userId);
    if (!profile) {
      return this.upsertStudentProfile({ userId, role });
    }
    await db.collection(COLLECTIONS.STUDENT_PROFILES).doc(profile.id).update({ role });
    return { ...profile, role };
  }

  // Activity methods
  async getActivity(id: string): Promise<FirebaseActivity | null> {
    const doc = await db.collection(COLLECTIONS.ACTIVITIES).doc(id).get();
    if (!doc.exists) return null;
    const data = doc.data()!;
    return {
      id: doc.id,
      userId: data.userId,
      type: data.type,
      nameAr: data.nameAr,
      nameEn: data.nameEn,
      organization: data.organization,
      hours: data.hours,
      startDate: fromTimestamp(data.startDate),
      endDate: fromTimestamp(data.endDate),
      descriptionAr: data.descriptionAr,
      descriptionEn: data.descriptionEn,
      proofUrl: data.proofUrl,
      certificateUrl: data.certificateUrl,
      status: data.status || "submitted",
      rejectionReason: data.rejectionReason,
      reviewedBy: data.reviewedBy,
      reviewedAt: fromTimestamp(data.reviewedAt),
      createdAt: fromTimestamp(data.createdAt),
    };
  }

  async getActivitiesByUser(userId: string): Promise<FirebaseActivity[]> {
    const snapshot = await db.collection(COLLECTIONS.ACTIVITIES).where("userId", "==", userId).get();
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        type: data.type,
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        organization: data.organization,
        hours: data.hours,
        startDate: fromTimestamp(data.startDate),
        endDate: fromTimestamp(data.endDate),
        descriptionAr: data.descriptionAr,
        descriptionEn: data.descriptionEn,
        proofUrl: data.proofUrl,
        certificateUrl: data.certificateUrl,
        status: data.status || "submitted",
        rejectionReason: data.rejectionReason,
        reviewedBy: data.reviewedBy,
        reviewedAt: fromTimestamp(data.reviewedAt),
        createdAt: fromTimestamp(data.createdAt),
      };
    });
  }

  async getAllActivities(): Promise<FirebaseActivity[]> {
    const snapshot = await db.collection(COLLECTIONS.ACTIVITIES).get();
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        type: data.type,
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        organization: data.organization,
        hours: data.hours,
        startDate: fromTimestamp(data.startDate),
        endDate: fromTimestamp(data.endDate),
        descriptionAr: data.descriptionAr,
        descriptionEn: data.descriptionEn,
        proofUrl: data.proofUrl,
        certificateUrl: data.certificateUrl,
        status: data.status || "submitted",
        rejectionReason: data.rejectionReason,
        reviewedBy: data.reviewedBy,
        reviewedAt: fromTimestamp(data.reviewedAt),
        createdAt: fromTimestamp(data.createdAt),
      };
    });
  }

  async createActivity(activity: Omit<FirebaseActivity, "id">): Promise<FirebaseActivity> {
    const docRef = db.collection(COLLECTIONS.ACTIVITIES).doc();
    const newActivity: FirebaseActivity = { ...activity, id: docRef.id };
    await docRef.set({
      ...activity,
      startDate: toTimestamp(activity.startDate),
      endDate: toTimestamp(activity.endDate),
      reviewedAt: toTimestamp(activity.reviewedAt),
      createdAt: toTimestamp(activity.createdAt),
    });
    return newActivity;
  }

  async reviewActivity(id: string, reviewerId: string, action: "approve" | "reject", reason?: string): Promise<FirebaseActivity> {
    const status = action === "approve" ? "approved" : "rejected";
    await db.collection(COLLECTIONS.ACTIVITIES).doc(id).update({
      status,
      rejectionReason: reason || null,
      reviewedBy: reviewerId,
      reviewedAt: Timestamp.now(),
    });
    const updated = await this.getActivity(id);
    return updated!;
  }

  // Course methods
  async getCourse(id: string): Promise<FirebaseCourse | null> {
    const doc = await db.collection(COLLECTIONS.COURSES).doc(id).get();
    if (!doc.exists) return null;
    const data = doc.data()!;
    return {
      id: doc.id,
      titleAr: data.titleAr,
      titleEn: data.titleEn,
      descriptionAr: data.descriptionAr,
      descriptionEn: data.descriptionEn,
      category: data.category,
      duration: data.duration,
      instructorId: data.instructorId,
      imageUrl: data.imageUrl,
      isPublished: data.isPublished ?? true,
      createdAt: fromTimestamp(data.createdAt),
    };
  }

  async getCourses(publishedOnly = true): Promise<FirebaseCourse[]> {
    let snapshot;
    if (publishedOnly) {
      snapshot = await db.collection(COLLECTIONS.COURSES).where("isPublished", "==", true).get();
    } else {
      snapshot = await db.collection(COLLECTIONS.COURSES).get();
    }
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        titleAr: data.titleAr,
        titleEn: data.titleEn,
        descriptionAr: data.descriptionAr,
        descriptionEn: data.descriptionEn,
        category: data.category,
        duration: data.duration,
        instructorId: data.instructorId,
        imageUrl: data.imageUrl,
        isPublished: data.isPublished ?? true,
        createdAt: fromTimestamp(data.createdAt),
      };
    });
  }

  async getAllCourses(): Promise<FirebaseCourse[]> {
    return this.getCourses(false);
  }

  async createCourse(course: Omit<FirebaseCourse, "id">): Promise<FirebaseCourse> {
    const docRef = db.collection(COLLECTIONS.COURSES).doc();
    const newCourse: FirebaseCourse = { ...course, id: docRef.id };
    await docRef.set({
      ...course,
      createdAt: toTimestamp(course.createdAt),
    });
    return newCourse;
  }

  async updateCourse(id: string, data: Partial<FirebaseCourse>): Promise<void> {
    await db.collection(COLLECTIONS.COURSES).doc(id).update(data);
  }

  async deleteCourse(id: string): Promise<void> {
    await db.collection(COLLECTIONS.COURSES).doc(id).delete();
  }

  // Lesson methods
  async getLesson(id: string): Promise<FirebaseCourseLesson | null> {
    const doc = await db.collection(COLLECTIONS.COURSE_LESSONS).doc(id).get();
    if (!doc.exists) return null;
    const data = doc.data()!;
    return {
      id: doc.id,
      courseId: data.courseId,
      titleAr: data.titleAr,
      titleEn: data.titleEn,
      contentAr: data.contentAr,
      contentEn: data.contentEn,
      videoUrl: data.videoUrl,
      orderIndex: data.orderIndex || 0,
      durationMinutes: data.durationMinutes || 0,
      createdAt: fromTimestamp(data.createdAt),
    };
  }

  async getLessonsByCourse(courseId: string): Promise<FirebaseCourseLesson[]> {
    const snapshot = await db.collection(COLLECTIONS.COURSE_LESSONS)
      .where("courseId", "==", courseId)
      .orderBy("orderIndex")
      .get();
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        courseId: data.courseId,
        titleAr: data.titleAr,
        titleEn: data.titleEn,
        contentAr: data.contentAr,
        contentEn: data.contentEn,
        videoUrl: data.videoUrl,
        orderIndex: data.orderIndex || 0,
        durationMinutes: data.durationMinutes || 0,
        createdAt: fromTimestamp(data.createdAt),
      };
    });
  }

  async createLesson(lesson: Omit<FirebaseCourseLesson, "id">): Promise<FirebaseCourseLesson> {
    const docRef = db.collection(COLLECTIONS.COURSE_LESSONS).doc();
    const newLesson: FirebaseCourseLesson = { ...lesson, id: docRef.id };
    await docRef.set({
      ...lesson,
      createdAt: toTimestamp(lesson.createdAt),
    });
    return newLesson;
  }

  async deleteLesson(id: string): Promise<void> {
    await db.collection(COLLECTIONS.COURSE_LESSONS).doc(id).delete();
  }

  // Quiz methods
  async getQuiz(id: string): Promise<FirebaseCourseQuiz | null> {
    const doc = await db.collection(COLLECTIONS.COURSE_QUIZZES).doc(id).get();
    if (!doc.exists) return null;
    const data = doc.data()!;
    return {
      id: doc.id,
      courseId: data.courseId,
      titleAr: data.titleAr,
      titleEn: data.titleEn,
      type: data.type || "intermediate",
      passingScore: data.passingScore || 60,
      orderIndex: data.orderIndex || 0,
      createdAt: fromTimestamp(data.createdAt),
    };
  }

  async getQuizzesByCourse(courseId: string): Promise<FirebaseCourseQuiz[]> {
    const snapshot = await db.collection(COLLECTIONS.COURSE_QUIZZES)
      .where("courseId", "==", courseId)
      .orderBy("orderIndex")
      .get();
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        courseId: data.courseId,
        titleAr: data.titleAr,
        titleEn: data.titleEn,
        type: data.type || "intermediate",
        passingScore: data.passingScore || 60,
        orderIndex: data.orderIndex || 0,
        createdAt: fromTimestamp(data.createdAt),
      };
    });
  }

  async createQuiz(quiz: Omit<FirebaseCourseQuiz, "id">): Promise<FirebaseCourseQuiz> {
    const docRef = db.collection(COLLECTIONS.COURSE_QUIZZES).doc();
    const newQuiz: FirebaseCourseQuiz = { ...quiz, id: docRef.id };
    await docRef.set({
      ...quiz,
      createdAt: toTimestamp(quiz.createdAt),
    });
    return newQuiz;
  }

  // Question methods
  async getQuestionsByQuiz(quizId: string): Promise<FirebaseQuizQuestion[]> {
    const snapshot = await db.collection(COLLECTIONS.QUIZ_QUESTIONS)
      .where("quizId", "==", quizId)
      .orderBy("orderIndex")
      .get();
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        quizId: data.quizId,
        questionAr: data.questionAr,
        questionEn: data.questionEn,
        options: data.options || [],
        correctAnswer: data.correctAnswer,
        orderIndex: data.orderIndex || 0,
      };
    });
  }

  async createQuestion(question: Omit<FirebaseQuizQuestion, "id">): Promise<FirebaseQuizQuestion> {
    const docRef = db.collection(COLLECTIONS.QUIZ_QUESTIONS).doc();
    const newQuestion: FirebaseQuizQuestion = { ...question, id: docRef.id };
    await docRef.set(newQuestion);
    return newQuestion;
  }

  // Quiz Attempt methods
  async createQuizAttempt(attempt: Omit<FirebaseQuizAttempt, "id">): Promise<FirebaseQuizAttempt> {
    const docRef = db.collection(COLLECTIONS.QUIZ_ATTEMPTS).doc();
    const newAttempt: FirebaseQuizAttempt = { ...attempt, id: docRef.id };
    await docRef.set({
      ...attempt,
      completedAt: toTimestamp(attempt.completedAt),
    });
    return newAttempt;
  }

  async getQuizAttempts(quizId: string, userId: string): Promise<FirebaseQuizAttempt[]> {
    const snapshot = await db.collection(COLLECTIONS.QUIZ_ATTEMPTS)
      .where("quizId", "==", quizId)
      .where("userId", "==", userId)
      .get();
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        quizId: data.quizId,
        userId: data.userId,
        score: data.score,
        passed: data.passed || false,
        answers: data.answers,
        completedAt: fromTimestamp(data.completedAt),
      };
    });
  }

  // Enrollment methods
  async getEnrollment(userId: string, courseId: string): Promise<FirebaseCourseEnrollment | null> {
    const snapshot = await db.collection(COLLECTIONS.COURSE_ENROLLMENTS)
      .where("userId", "==", userId)
      .where("courseId", "==", courseId)
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId,
      courseId: data.courseId,
      progress: data.progress || 0,
      completedLessons: data.completedLessons || [],
      isCompleted: data.isCompleted || false,
      completedAt: fromTimestamp(data.completedAt),
      createdAt: fromTimestamp(data.createdAt),
    };
  }

  async getEnrollmentsByUser(userId: string): Promise<FirebaseCourseEnrollment[]> {
    const snapshot = await db.collection(COLLECTIONS.COURSE_ENROLLMENTS)
      .where("userId", "==", userId)
      .get();
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        courseId: data.courseId,
        progress: data.progress || 0,
        completedLessons: data.completedLessons || [],
        isCompleted: data.isCompleted || false,
        completedAt: fromTimestamp(data.completedAt),
        createdAt: fromTimestamp(data.createdAt),
      };
    });
  }

  async createEnrollment(enrollment: Omit<FirebaseCourseEnrollment, "id">): Promise<FirebaseCourseEnrollment> {
    const docRef = db.collection(COLLECTIONS.COURSE_ENROLLMENTS).doc();
    const newEnrollment: FirebaseCourseEnrollment = { ...enrollment, id: docRef.id };
    await docRef.set({
      ...enrollment,
      completedAt: toTimestamp(enrollment.completedAt),
      createdAt: toTimestamp(enrollment.createdAt),
    });
    return newEnrollment;
  }

  async updateEnrollment(id: string, data: Partial<FirebaseCourseEnrollment>): Promise<void> {
    const updateData: any = { ...data };
    if (data.completedAt) updateData.completedAt = toTimestamp(data.completedAt);
    await db.collection(COLLECTIONS.COURSE_ENROLLMENTS).doc(id).update(updateData);
  }

  // Lesson Progress methods
  async markLessonComplete(userId: string, lessonId: string): Promise<FirebaseLessonProgress> {
    const existing = await db.collection(COLLECTIONS.LESSON_PROGRESS)
      .where("userId", "==", userId)
      .where("lessonId", "==", lessonId)
      .limit(1)
      .get();

    if (!existing.empty) {
      await existing.docs[0].ref.update({ completed: true, completedAt: Timestamp.now() });
      const data = existing.docs[0].data();
      return { id: existing.docs[0].id, userId, lessonId, completed: true, completedAt: new Date() };
    }

    const docRef = db.collection(COLLECTIONS.LESSON_PROGRESS).doc();
    const progress: FirebaseLessonProgress = {
      id: docRef.id,
      userId,
      lessonId,
      completed: true,
      completedAt: new Date(),
    };
    await docRef.set(progress);
    return progress;
  }

  async getUserLessonProgress(userId: string, courseId: string): Promise<FirebaseLessonProgress[]> {
    const lessons = await this.getLessonsByCourse(courseId);
    const lessonIds = lessons.map(l => l.id);
    
    if (lessonIds.length === 0) return [];
    
    // For simplicity, get all progress for this user
    const snapshot = await db.collection(COLLECTIONS.LESSON_PROGRESS)
      .where("userId", "==", userId)
      .get();
    
    return snapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          lessonId: data.lessonId,
          completed: data.completed || false,
          completedAt: fromTimestamp(data.completedAt),
        };
      })
      .filter(p => lessonIds.includes(p.lessonId));
  }

  // Certificate methods
  async getCertificateByVerification(code: string): Promise<FirebaseCertificate | null> {
    const snapshot = await db.collection(COLLECTIONS.CERTIFICATES)
      .where("verificationCode", "==", code)
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId,
      courseId: data.courseId,
      activityId: data.activityId,
      type: data.type || "course_completion",
      titleAr: data.titleAr,
      titleEn: data.titleEn,
      certificateNumber: data.certificateNumber,
      issuedAt: fromTimestamp(data.issuedAt),
      verificationCode: data.verificationCode,
    };
  }

  async getCertificateById(id: string): Promise<FirebaseCertificate | null> {
    const doc = await db.collection(COLLECTIONS.CERTIFICATES).doc(id).get();
    if (!doc.exists) return null;
    const data = doc.data()!;
    return {
      id: doc.id,
      userId: data.userId,
      courseId: data.courseId,
      activityId: data.activityId,
      type: data.type || "course_completion",
      titleAr: data.titleAr,
      titleEn: data.titleEn,
      certificateNumber: data.certificateNumber,
      issuedAt: fromTimestamp(data.issuedAt),
      verificationCode: data.verificationCode,
    };
  }

  async getCertificatesByUser(userId: string): Promise<FirebaseCertificate[]> {
    const snapshot = await db.collection(COLLECTIONS.CERTIFICATES)
      .where("userId", "==", userId)
      .get();
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        courseId: data.courseId,
        activityId: data.activityId,
        type: data.type || "course_completion",
        titleAr: data.titleAr,
        titleEn: data.titleEn,
        certificateNumber: data.certificateNumber,
        issuedAt: fromTimestamp(data.issuedAt),
        verificationCode: data.verificationCode,
      };
    });
  }

  async createCertificate(cert: Omit<FirebaseCertificate, "id">): Promise<FirebaseCertificate> {
    const docRef = db.collection(COLLECTIONS.CERTIFICATES).doc();
    const newCert: FirebaseCertificate = { ...cert, id: docRef.id };
    await docRef.set({
      ...cert,
      issuedAt: toTimestamp(cert.issuedAt),
    });
    return newCert;
  }

  // Audit Log methods
  async createAuditLog(log: Omit<FirebaseAuditLog, "id">): Promise<FirebaseAuditLog> {
    const docRef = db.collection(COLLECTIONS.AUDIT_LOGS).doc();
    const newLog: FirebaseAuditLog = { ...log, id: docRef.id };
    await docRef.set({
      ...log,
      createdAt: toTimestamp(log.createdAt),
    });
    return newLog;
  }

  async getAuditLogs(limit = 100): Promise<FirebaseAuditLog[]> {
    const snapshot = await db.collection(COLLECTIONS.AUDIT_LOGS)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        actorUserId: data.actorUserId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        details: data.details,
        createdAt: fromTimestamp(data.createdAt),
      };
    });
  }

  // Stats methods
  async getStats(): Promise<any> {
    const [users, profiles, activities, courses, certificates] = await Promise.all([
      this.getAllUsers(),
      this.getAllStudentProfiles(),
      this.getAllActivities(),
      this.getCourses(),
      db.collection(COLLECTIONS.CERTIFICATES).get(),
    ]);

    const approvedActivities = activities.filter(a => a.status === "approved");
    const students = profiles.filter(p => p.role === "student" || !p.role);
    const trainers = profiles.filter(p => p.role === "trainer");
    const supervisors = profiles.filter(p => p.role === "supervisor");

    return {
      totalUsers: users.length,
      totalStudents: students.length,
      totalTrainers: trainers.length,
      totalSupervisors: supervisors.length,
      totalActivities: activities.length,
      approvedActivities: approvedActivities.length,
      pendingActivities: activities.filter(a => a.status === "submitted").length,
      totalCourses: courses.length,
      publishedCourses: courses.filter(c => c.isPublished).length,
      totalCertificates: certificates.size,
    };
  }

  // Report methods
  async getReportHoursByStudent(): Promise<any[]> {
    const activities = await this.getAllActivities();
    const approved = activities.filter(a => a.status === "approved");
    
    const byUser: Record<string, number> = {};
    approved.forEach(a => {
      byUser[a.userId] = (byUser[a.userId] || 0) + a.hours;
    });

    const users = await this.getAllUsers();
    const profiles = await this.getAllStudentProfiles();

    return users.map(user => {
      const profile = profiles.find(p => p.userId === user.id);
      return {
        userId: user.id,
        name: `${user.firstName || ""} ${user.lastName || ""}`,
        email: user.email,
        studentId: profile?.studentId,
        totalHours: byUser[user.id] || 0,
      };
    }).filter(u => u.totalHours > 0);
  }

  async getReportStudentsByMajor(): Promise<any[]> {
    const profiles = await this.getAllStudentProfiles();
    const students = profiles.filter(p => p.role === "student" || !p.role);
    
    const byMajor: Record<string, number> = {};
    students.forEach(p => {
      const major = p.major || "غير محدد";
      byMajor[major] = (byMajor[major] || 0) + 1;
    });

    return Object.entries(byMajor).map(([major, count]) => ({ major, count }));
  }

  async getReportCompletedCourses(): Promise<any[]> {
    const snapshot = await db.collection(COLLECTIONS.COURSE_ENROLLMENTS)
      .where("isCompleted", "==", true)
      .get();
    
    return snapshot.docs.map(doc => doc.data());
  }

  async getReportApprovedActivities(): Promise<any[]> {
    const activities = await this.getAllActivities();
    return activities.filter(a => a.status === "approved");
  }
}

// Export singleton instance
export const firebaseStorage = new FirebaseStorage();

