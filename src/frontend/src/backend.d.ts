import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface Paper {
    id: string;
    status: Status;
    title: string;
    userId: Principal;
    filename: string;
    blobId: ExternalBlob;
    uploadedAt: Time;
}
export interface PaperResult {
    id: string;
    weakSections: Array<string>;
    weaknesses: Array<string>;
    acceptanceProbability: number;
    overallScore: number;
    rawReport: string;
    strengths: Array<string>;
    citationScore: number;
    suggestedImprovements: Array<string>;
    methodologyScore: number;
    clarityScore: number;
    reproducibilityScore: number;
    submittedAt: Time;
    noveltyScore: number;
    experimentScore: number;
    researchGaps: Array<string>;
    paperId: string;
    recommendation: Recommendation;
}
export interface UserProfile {
    name: string;
}
export enum Recommendation {
    reject = "reject",
    accept = "accept",
    borderline = "borderline",
    strongReject = "strongReject",
    strongAccept = "strongAccept",
    weakReject = "weakReject",
    weakAccept = "weakAccept"
}
export enum Status {
    pendingReview = "pendingReview",
    analyzing = "analyzing",
    approved = "approved",
    rejected = "rejected",
    uploaded = "uploaded",
    reviewed = "reviewed",
    accepted = "accepted"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addPaper(id: string, title: string, filename: string, blobId: ExternalBlob): Promise<void>;
    addPaperResult(result: PaperResult): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllPaperResults(): Promise<Array<PaperResult>>;
    getAllPapers(): Promise<Array<Paper>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getPaper(id: string): Promise<Paper | null>;
    getPaperResult(id: string): Promise<PaperResult | null>;
    getPaperResultsForPaper(paperId: string): Promise<Array<PaperResult>>;
    getPaperStatus(paperId: string): Promise<Status | null>;
    getPapersByStatus(status: Status): Promise<Array<Paper>>;
    getPapersByUser(userId: Principal): Promise<Array<Paper>>;
    getStatus(paperId: string): Promise<Status | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setPaperStatus(paperId: string, status: Status): Promise<void>;
    setStatus(paperId: string, status: Status): Promise<void>;
    updatePaperStatus(id: string, status: Status): Promise<void>;
}
