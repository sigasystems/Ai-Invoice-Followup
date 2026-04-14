export interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;

    onTimeRate: number; // 0–100
    aiForecast: string; // "Calculating..." | "High" | etc
    behaviorScore: number; // 0–100

    riskLevel: "Low Risk" | "Medium Risk" | "High Risk";
    outstanding: number;

    createdAt?: string;
    updatedAt?: string;
}