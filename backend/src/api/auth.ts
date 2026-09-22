import { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";

import {
  getAuthenticatedUser,
  createToken,
  AuthUser,
} from "../auth";

import {
  createSession,
  getSession,
  deleteSession,
} from "../auth/session";

import { db } from "../database";

export async function authRoutes(
  app: FastifyInstance
) {
  /*
   * ============================================================
   * COOKIE CONFIGURATION
   * ============================================================
   */

  const cookieSecure =
    process.env.PTALK_COOKIE_SECURE === "true";

  /*
   * ============================================================
   * LOGIN
   * ============================================================
   */

  app.post<{
    Body: {
      email: string;
      password: string;
    };
  }>(
    "/api/auth/login",
    async (request, reply) => {
      const {
        email,
        password,
      } = request.body;

      if (!email || !password) {
        return reply.status(400).send({
          error:
            "email and password are required",
        });
      }

      try {
        const result = await db.query(
          `
          SELECT
              id,
              patient_id,
              email,
              password_hash,
              role,
              status
          FROM public.ptalk_users
          WHERE email = $1
          LIMIT 1;
          `,
          [email.trim().toLowerCase()]
        );

        if (result.rows.length === 0) {
          return reply.status(401).send({
            error: "Invalid credentials",
          });
        }

        const userRow = result.rows[0];

        const passwordValid =
          await bcrypt.compare(
            password,
            userRow.password_hash
          );

        if (!passwordValid) {
          return reply.status(401).send({
            error: "Invalid credentials",
          });
        }

        /*
         * --------------------------------------------------------
         * Medical team approval check
         * --------------------------------------------------------
         */

        if (
          userRow.role === "medical_team" &&
          userRow.status !== "approved"
        ) {
          if (userRow.status === "pending") {
            return reply.status(403).send({
              error:
                "Your medical team account is waiting for administrator approval.",
              code: "MEDICAL_TEAM_PENDING",
            });
          }

          if (userRow.status === "rejected") {
            return reply.status(403).send({
              error:
                "Your medical team account has not been approved.",
              code: "MEDICAL_TEAM_REJECTED",
            });
          }
        }

        /*
         * --------------------------------------------------------
         * Authenticated user
         * --------------------------------------------------------
         */

        const user: AuthUser = {
          id: userRow.id,
          role: userRow.role,
          status: userRow.status,
          patient_id:
            userRow.patient_id,
        };

        /*
         * --------------------------------------------------------
         * Create session
         * --------------------------------------------------------
         */

        const token =
          createToken();

        const expiresAt =
          new Date(
            Date.now() +
              8 * 60 * 60 * 1000
          );

        await createSession(
          token,
          user,
          expiresAt
        );

        /*
         * --------------------------------------------------------
         * HTTP-only cookie
         * --------------------------------------------------------
         */

        reply.setCookie(
          "ptalk_session",
          token,
          {
            httpOnly: true,
            secure: cookieSecure,
            sameSite: "lax",
            path: "/",
            maxAge:
              60 * 60 * 8,
          }
        );

        return {
          user,
        };
      } catch (error) {
        app.log.error(error);

        return reply.status(500).send({
          error: "Login failed",
        });
      }
    }
  );

  /*
   * ============================================================
   * PATIENT REGISTRATION
   * ============================================================
   */

  app.post<{
    Body: {
      first_name: string;
      last_name: string;
      date_of_birth: string;
      email: string;
      password: string;
    };
  }>(
    "/api/auth/register",
    async (request, reply) => {
      const {
        first_name,
        last_name,
        date_of_birth,
        email,
        password,
      } = request.body;

      if (
        !first_name ||
        !last_name ||
        !date_of_birth ||
        !email ||
        !password
      ) {
        return reply.status(400).send({
          error:
            "first_name, last_name, date_of_birth, email and password are required",
        });
      }

      const normalizedFirstName =
        first_name.trim();

      const normalizedLastName =
        last_name.trim();

      const normalizedEmail =
        email.trim().toLowerCase();

      if (
        !normalizedFirstName ||
        !normalizedLastName ||
        !date_of_birth ||
        !normalizedEmail
      ) {
        return reply.status(400).send({
          error:
            "All registration fields are required",
        });
      }

      if (password.length < 8) {
        return reply.status(400).send({
          error:
            "Password must be at least 8 characters long",
        });
      }

      try {
        /*
         * Check duplicate email
         */

        const existingUser =
          await db.query(
            `
            SELECT id
            FROM public.ptalk_users
            WHERE email = $1
            LIMIT 1;
            `,
            [normalizedEmail]
          );

        if (existingUser.rows.length > 0) {
          return reply.status(409).send({
            error:
              "An account with this email already exists",
          });
        }

        /*
         * Create patient identity
         */

        const patientResult =
          await db.query(
            `
            INSERT INTO public.patient_identity (
                first_name,
                last_name,
                date_of_birth
            )
            VALUES (
                $1,
                $2,
                $3
            )
            RETURNING
                patient_id,
                first_name,
                last_name,
                date_of_birth;
            `,
            [
              normalizedFirstName,
              normalizedLastName,
              date_of_birth,
            ]
          );

        if (patientResult.rows.length === 0) {
          return reply.status(500).send({
            error:
              "Patient creation failed",
          });
        }

        const patient =
          patientResult.rows[0];

        /*
         * Hash password
         */

        const passwordHash =
          await bcrypt.hash(
            password,
            12
          );

        /*
         * Create user
         */

        const userResult =
          await db.query(
            `
            INSERT INTO public.ptalk_users (
                patient_id,
                email,
                password_hash,
                role,
                status
            )
            VALUES (
                $1,
                $2,
                $3,
                'patient',
                'approved'
            )
            RETURNING
                id,
                patient_id,
                email,
                role,
                status;
            `,
            [
              patient.patient_id,
              normalizedEmail,
              passwordHash,
            ]
          );

        if (userResult.rows.length === 0) {
          return reply.status(500).send({
            error:
              "User creation failed",
          });
        }

        const userRow =
          userResult.rows[0];

        const user: AuthUser = {
          id: userRow.id,
          role: userRow.role,
          status: userRow.status,
          patient_id:
            userRow.patient_id,
        };

        /*
         * Create session
         */

        const token =
          createToken();

        const expiresAt =
          new Date(
            Date.now() +
              8 * 60 * 60 * 1000
          );

        await createSession(
          token,
          user,
          expiresAt
        );

        reply.setCookie(
          "ptalk_session",
          token,
          {
            httpOnly: true,
            secure: cookieSecure,
            sameSite: "lax",
            path: "/",
            maxAge:
              60 * 60 * 8,
          }
        );

        return reply
          .status(201)
          .send({
            user,
            patient: {
              patient_id:
                patient.patient_id,
              first_name:
                patient.first_name,
              last_name:
                patient.last_name,
              date_of_birth:
                patient.date_of_birth,
            },
          });
      } catch (error: any) {
        app.log.error(
          {
            error,
            message: error?.message,
            code: error?.code,
            detail: error?.detail,
            constraint:
              error?.constraint,
            table: error?.table,
            column: error?.column,
          },
          "Registration failed"
        );

        return reply.status(500).send({
          error:
            "Registration failed",
          details: {
            message:
              error?.message ??
              "Unknown database error",
            code:
              error?.code ?? null,
            detail:
              error?.detail ?? null,
            constraint:
              error?.constraint ?? null,
            table:
              error?.table ?? null,
            column:
              error?.column ?? null,
          },
        });
      }
    }
  );

  /*
   * ============================================================
   * MEDICAL TEAM REGISTRATION
   * ============================================================
   *
   * Creates a medical_team account with status = pending.
   *
   * No patient_identity is created.
   * No session is created.
   *
   * An administrator must approve the account first.
   */

  app.post<{
    Body: {
      first_name: string;
      last_name: string;
      email: string;
      password: string;
    };
  }>(
    "/api/auth/register-medical",
    async (request, reply) => {
      const {
        first_name,
        last_name,
        email,
        password,
      } = request.body;

      if (
        !first_name ||
        !last_name ||
        !email ||
        !password
      ) {
        return reply.status(400).send({
          error:
            "first_name, last_name, email and password are required",
        });
      }

      const normalizedFirstName =
        first_name.trim();

      const normalizedLastName =
        last_name.trim();

      const normalizedEmail =
        email.trim().toLowerCase();

      if (
        !normalizedFirstName ||
        !normalizedLastName ||
        !normalizedEmail
      ) {
        return reply.status(400).send({
          error:
            "All registration fields are required",
        });
      }

      if (password.length < 8) {
        return reply.status(400).send({
          error:
            "Password must be at least 8 characters long",
        });
      }

      try {
        /*
         * Check duplicate email
         */

        const existingUser =
          await db.query(
            `
            SELECT id
            FROM public.ptalk_users
            WHERE email = $1
            LIMIT 1;
            `,
            [normalizedEmail]
          );

        if (existingUser.rows.length > 0) {
          return reply.status(409).send({
            error:
              "An account with this email already exists",
          });
        }

        /*
         * Hash password
         */

        const passwordHash =
          await bcrypt.hash(
            password,
            12
          );

        /*
         * Create pending medical account
         */

        const userResult =
          await db.query(
            `
            INSERT INTO public.ptalk_users (
                patient_id,
                email,
                password_hash,
                role,
                status
            )
            VALUES (
                NULL,
                $1,
                $2,
                'medical_team',
                'pending'
            )
            RETURNING
                id,
                email,
                role,
                status;
            `,
            [
              normalizedEmail,
              passwordHash,
            ]
          );

        if (userResult.rows.length === 0) {
          return reply.status(500).send({
            error:
              "Medical team account creation failed",
          });
        }

        return reply
          .status(201)
          .send({
            success: true,
            message:
              "Medical team registration submitted. Your account is waiting for administrator approval.",
            user: {
              id:
                userResult.rows[0].id,
              email:
                userResult.rows[0].email,
              role:
                userResult.rows[0].role,
              status:
                userResult.rows[0].status,
            },
          });
      } catch (error: any) {
        app.log.error(
          {
            error,
            message: error?.message,
            code: error?.code,
            detail: error?.detail,
            constraint:
              error?.constraint,
            table: error?.table,
            column: error?.column,
          },
          "Medical registration failed"
        );

        return reply.status(500).send({
          error:
            "Medical team registration failed",
          details: {
            message:
              error?.message ??
              "Unknown database error",
            code:
              error?.code ?? null,
            detail:
              error?.detail ?? null,
            constraint:
              error?.constraint ?? null,
            table:
              error?.table ?? null,
            column:
              error?.column ?? null,
          },
        });
      }
    }
  );

  /*
   * ============================================================
   * CURRENT USER
   * ============================================================
   */

  app.get(
    "/api/auth/me",
    async (request, reply) => {
      try {
        let user: AuthUser | null =
          null;

        const authorization =
          request.headers.authorization;

        if (authorization) {
          user =
            await getAuthenticatedUser(
              authorization
            );
        }

        if (!user) {
          const token =
            request.cookies
              .ptalk_session;

          if (token) {
            user =
              await getSession(
                token
              );
          }
        }

        if (!user) {
          return reply.status(401).send({
            error: "Unauthorized",
          });
        }

        return reply.send({
          user,
        });
      } catch (error) {
        app.log.error(error);

        return reply.status(500).send({
          error:
            "Failed to load authenticated user",
        });
      }
    }
  );

  /*
   * ============================================================
   * LOGOUT
   * ============================================================
   */

  app.post(
    "/api/auth/logout",
    async (request, reply) => {
      try {
        const token =
          request.cookies
            .ptalk_session;

        if (token) {
          await deleteSession(
            token
          );
        }

        reply.clearCookie(
          "ptalk_session",
          {
            httpOnly: true,
            secure: cookieSecure,
            sameSite: "lax",
            path: "/",
          }
        );

        return {
          success: true,
        };
      } catch (error) {
        app.log.error(error);

        return reply.status(500).send({
          error:
            "Logout failed",
        });
      }
    }
  );
}