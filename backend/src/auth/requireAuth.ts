import {
  FastifyReply,
  FastifyRequest,
} from "fastify";

import {
  AuthUser,
  UserRole,
} from "./index";

import { getSession } from "./session";

/*
 * ============================================================
 * REQUIRE AUTHENTICATION
 * ============================================================
 *
 * Reads the ptalk_session cookie and verifies the session
 * against PostgreSQL.
 *
 * Returns:
 *   AuthUser  -> authenticated user
 *   null      -> request already received an HTTP error
 */

export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<AuthUser | null> {
  const token =
    request.cookies.ptalk_session;

  if (!token) {
    reply.status(401).send({
      error: "Unauthorized",
    });

    return null;
  }

  const user =
    await getSession(token);

  if (!user) {
    reply.status(401).send({
      error: "Invalid session",
    });

    return null;
  }

  /*
   * ------------------------------------------------------------
   * Medical team approval
   * ------------------------------------------------------------
   *
   * A medical_team account must be approved before
   * it can access protected backend resources.
   */

  if (
    user.role === "medical_team" &&
    user.status !== "approved"
  ) {
    if (user.status === "pending") {
      reply.status(403).send({
        error:
          "Medical team account is waiting for administrator approval.",
        code: "MEDICAL_TEAM_PENDING",
      });

      return null;
    }

    if (user.status === "rejected") {
      reply.status(403).send({
        error:
          "Medical team account has been rejected.",
        code: "MEDICAL_TEAM_REJECTED",
      });

      return null;
    }

    reply.status(403).send({
      error:
        "Medical team account is not approved.",
      code: "MEDICAL_TEAM_NOT_APPROVED",
    });

    return null;
  }

  return user;
}

/*
 * ============================================================
 * REQUIRE ROLE
 * ============================================================
 *
 * Verifies authentication and additionally checks
 * the user's role.
 *
 * Medical team accounts must also be approved.
 */

export async function requireRole(
  request: FastifyRequest,
  reply: FastifyReply,
  allowedRoles: UserRole[]
): Promise<AuthUser | null> {
  const user =
    await requireAuth(
      request,
      reply
    );

  if (!user) {
    return null;
  }

  if (
    !allowedRoles.includes(user.role)
  ) {
    reply.status(403).send({
      error: "Forbidden",
    });

    return null;
  }

  return user;
}