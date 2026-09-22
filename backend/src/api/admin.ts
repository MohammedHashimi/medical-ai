import { FastifyInstance } from "fastify";

import { requireRole } from "../auth/requireAuth";
import { db } from "../database";

export async function adminRoutes(
  app: FastifyInstance
) {
  /*
   * ============================================================
   * LIST MEDICAL TEAM USERS
   * ============================================================
   *
   * Admin only.
   *
   * Returns all medical_team accounts.
   */

  app.get(
    "/api/admin/medical-users",
    async (request, reply) => {
      const user = await requireRole(
        request,
        reply,
        ["admin"]
      );

      if (!user) {
        return;
      }

      try {
        const result = await db.query(
          `
          SELECT
              id,
              email,
              role,
              status,
              created_at
          FROM public.ptalk_users
          WHERE role = 'medical_team'
          ORDER BY created_at DESC;
          `
        );

        return reply.send({
          users: result.rows,
        });
      } catch (error) {
        app.log.error(error);

        return reply.status(500).send({
          error:
            "Failed to load medical team users",
        });
      }
    }
  );

  /*
   * ============================================================
   * APPROVE MEDICAL TEAM USER
   * ============================================================
   */

  app.post<{
    Params: {
      id: string;
    };
  }>(
    "/api/admin/medical-users/:id/approve",
    async (request, reply) => {
      const user = await requireRole(
        request,
        reply,
        ["admin"]
      );

      if (!user) {
        return;
      }

      const { id } = request.params;

      try {
        const result = await db.query(
          `
          UPDATE public.ptalk_users
          SET status = 'approved'
          WHERE id = $1
            AND role = 'medical_team'
          RETURNING
              id,
              email,
              role,
              status,
              created_at;
          `,
          [id]
        );

        if (result.rows.length === 0) {
          return reply.status(404).send({
            error:
              "Medical team user not found",
          });
        }

        return reply.send({
          success: true,
          user: result.rows[0],
        });
      } catch (error) {
        app.log.error(error);

        return reply.status(500).send({
          error:
            "Failed to approve medical team user",
        });
      }
    }
  );

  /*
   * ============================================================
   * REJECT MEDICAL TEAM USER
   * ============================================================
   */

  app.post<{
    Params: {
      id: string;
    };
  }>(
    "/api/admin/medical-users/:id/reject",
    async (request, reply) => {
      const user = await requireRole(
        request,
        reply,
        ["admin"]
      );

      if (!user) {
        return;
      }

      const { id } = request.params;

      try {
        const result = await db.query(
          `
          UPDATE public.ptalk_users
          SET status = 'rejected'
          WHERE id = $1
            AND role = 'medical_team'
          RETURNING
              id,
              email,
              role,
              status,
              created_at;
          `,
          [id]
        );

        if (result.rows.length === 0) {
          return reply.status(404).send({
            error:
              "Medical team user not found",
          });
        }

        return reply.send({
          success: true,
          user: result.rows[0],
        });
      } catch (error) {
        app.log.error(error);

        return reply.status(500).send({
          error:
            "Failed to reject medical team user",
        });
      }
    }
  );
}