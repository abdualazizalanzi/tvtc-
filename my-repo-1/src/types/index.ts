// This file exports interfaces or types used throughout the application.

export interface User {
    id: string;
    name: string;
    email: string;
    profileImageUrl?: string;
}

export interface Activity {
    id: string;
    userId: string;
    type: string;
    name: {
        en: string;
        ar: string;
    };
    organization: string;
    hours: number;
    startDate: Date;
    endDate: Date;
    description: {
        en: string;
        ar: string;
    };
    proofUrl?: string;
    certificateUrl?: string;
    status: 'submitted' | 'under_review' | 'approved' | 'rejected';
    rejectionReason?: string;
    reviewedBy?: string;
    reviewedAt?: Date;
}

export interface Course {
    id: string;
    title: {
        en: string;
        ar: string;
    };
    description: {
        en: string;
        ar: string;
    };
    category: string;
    duration: number;
    instructorId: string;
    imageUrl?: string;
    isPublished: boolean;
    createdAt: Date;
}

export interface Certificate {
    id: string;
    userId: string;
    courseId: string;
    type: string;
    title: {
        en: string;
        ar: string;
    };
    certificateNumber: string;
    issuedAt: Date;
    verificationCode: string;
}