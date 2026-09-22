import { db } from "../database";
import { AuthUser } from "./index";

export async function createSession(
  token: string,
  user: AuthUser,
  expiresAt: Date
): Promise<void> {
  await db.query(
    `
    INSERT INTO public.ptalk_sessions (
        token,
        user_id,
        expires_at
    )
    VALUES ($1, $2, $3);
    `,
    [token, user.id, expiresAt]
  );
}

export async function getSession(
  token: string
): Promise<AuthUser | null> {
  if (!token) {
    return null;
  }

  const result = await db.query(
    `
    SELECT
        s.token,
        s.expires_at,
        u.id,
        u.role,
        u.status,
        u.patient_id
    FROM public.ptalk_sessions s
    INNER JOIN public.ptalk_users u
        ON u.id = s.user_id
    WHERE s.token = $1
    LIMIT 1;
    `,
    [token]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const session = result.rows[0];

  const expiresAt = new Date(session.expires_at);

  if (Number.isNaN(expiresAt.getTime())) {
    await deleteSession(token);
    return null;
  }

  if (expiresAt.getTime() <= Date.now()) {
    await deleteSession(token);
    return null;
  }

  return {
    id: session.id,
    role: session.role,
    status: session.status,
    patient_id: session.patient_id,
  };
}

export async function deleteSession(
  token: string
): Promise<void> {
  if (!token) {
    return;
  }

  await db.query(
    `
    DELETE FROM public.ptalk_sessions
    WHERE token = $1;
    `,
    [token]
  );
}

export async function cleanupExpiredSessions(): Promise<number> {
  const result = await db.query(
    `
    DELETE FROM public.ptalk_sessions
    WHERE expires_at <= NOW()
    RETURNING token;
    `
  );

  return result.rowCount ?? 0;
}