import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface SoilAnalysisRecord {
    id: bigint;
    remediationCycles: bigint;
    owner: Principal;
    parameters: SoilParameters;
    recommendedPlant: string;
    confidenceScore: number;
    timestamp: bigint;
}
export interface SoilParameters {
    pH: number;
    chromiumPPM: number;
    leadPPM: number;
    phosphorusPPM: number;
    zincPPM: number;
    nickelPPM: number;
    organicMatterPercentage: number;
    arsenicPPM: number;
    nitrogenPPM: number;
    cadmiumPPM: number;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createSoilAnalysisRecord(parameters: SoilParameters, recommendedPlant: string, remediationCycles: bigint, confidenceScore: number, owner: Principal): Promise<SoilAnalysisRecord>;
    deleteAnalysis(recordId: bigint): Promise<void>;
    getAllRecords(): Promise<Array<SoilAnalysisRecord>>;
    getAnalysis(recordId: bigint): Promise<SoilAnalysisRecord>;
    getAnalysisHistory(): Promise<Array<SoilAnalysisRecord>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getRecordCount(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveAnalysis(parameters: SoilParameters, recommendedPlant: string, remediationCycles: bigint, confidenceScore: number): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
