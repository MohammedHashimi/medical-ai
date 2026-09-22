import { randomBytes } from "crypto";
import { getSession } from "./session";

export type UserRole =
  | "patient"
  | "medical_team"
  | "admin";

export type UserStatus =
  | "pending"
  | "approved"
  | "rejected";

export type AuthUser = {
  id: string;
  role: UserRole;
  status: UserStatus;
  patient_id: string | null;
};

export function createToken(): string {
  return randomBytes(32).toString("hex");
}

export async function getAuthenticatedUser(
  authorization?: string
): Promise<AuthUser | null> {
  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.substring(7);

  return await getSession(token);
}