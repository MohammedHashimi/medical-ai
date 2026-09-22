import { FastifyInstance } from "fastify";

import { db } from "../database";
import { requireRole } from "../auth/requireAuth";

export async function patientsRoutes(
  app: FastifyInstance
) {
  console.log(
    "PTALK: patientsRoutes loaded"
  );

  /*
   * ============================================================
   * MEDICAL TEAM - PATIENT LIST
   * ============================================================
   */

  app.get<{
    Querystring: {
      date?: string;
    };
  }>(
    "/api/team/patients",
    async (request, reply) => {
      const user = await requireRole(
        request,
        reply,
        ["medical_team"]
      );

      if (!user) {
        return;
      }

      const { date } = request.query;

      /*
       * --------------------------------------------------------
       * Validate optional date
       * --------------------------------------------------------
       */

      if (
        date !== undefined &&
        !/^\d{4}-\d{2}-\d{2}$/.test(date)
      ) {
        return reply.status(400).send({
          error:
            "date must use YYYY-MM-DD format",
        });
      }

      try {
        /*
         * ------------------------------------------------------
         * No date selected
         *
         * Show all patients.
         * ------------------------------------------------------
         */

        if (!date) {
          const result = await db.query(`
            SELECT
                pc.patient_id,
                pi.first_name,
                pi.last_name,
                COUNT(*) AS consultation_count,
                MAX(pc.consultation_date) AS last_consultation,
                CASE
                    WHEN COUNT(*) FILTER (
                        WHERE pc.emergency = true
                    ) > 0
                    THEN 1
                    ELSE 0
                END AS emergency
            FROM public.patient_consultations pc
            LEFT JOIN public.patient_identity pi
                ON pi.patient_id = pc.patient_id
            GROUP BY
                pc.patient_id,
                pi.first_name,
                pi.last_name
            ORDER BY
                last_consultation DESC;
          `);

          return result.rows;
        }

        /*
         * ------------------------------------------------------
         * Date selected
         *
         * Only consultations from the selected calendar day
         * are included.
         * ------------------------------------------------------
         */

        const result = await db.query(
          `
          SELECT
              pc.patient_id,
              pi.first_name,
              pi.last_name,
              COUNT(*) AS consultation_count,
              MAX(pc.consultation_date) AS last_consultation,
              CASE
                  WHEN COUNT(*) FILTER (
                      WHERE pc.emergency = true
                  ) > 0
                  THEN 1
                  ELSE 0
              END AS emergency
          FROM public.patient_consultations pc
          LEFT JOIN public.patient_identity pi
              ON pi.patient_id = pc.patient_id
          WHERE
              pc.consultation_date >= $1::date
              AND pc.consultation_date < (
                  $1::date + INTERVAL '1 day'
              )
          GROUP BY
              pc.patient_id,
              pi.first_name,
              pi.last_name
          ORDER BY
              last_consultation DESC;
          `,
          [date]
        );

        return result.rows;
      } catch (error) {
        app.log.error(error);

        return reply.status(500).send({
          error: "Failed to load patients",
        });
      }
    }
  );

  /*
   * ============================================================
   * MEDICAL TEAM - PATIENT HISTORY
   * ============================================================
   */

  app.get<{
    Params: {
      patient_id: string;
    };
  }>(
    "/api/team/patients/:patient_id/history",
    async (request, reply) => {
      const user = await requireRole(
        request,
        reply,
        ["medical_team"]
      );

      if (!user) {
        return;
      }

      const { patient_id } =
        request.params;

      if (!patient_id) {
        return reply.status(400).send({
          error: "patient_id is required",
        });
      }

      try {
        const patientResult =
          await db.query(
            `
            SELECT
                patient_id,
                first_name,
                last_name,
                date_of_birth
            FROM public.patient_identity
            WHERE patient_id = $1
            LIMIT 1;
            `,
            [patient_id]
          );

        if (
          patientResult.rows.length === 0
        ) {
          return reply.status(404).send({
            error: "Patient not found",
          });
        }

        const consultationResult =
          await db.query(
            `
            SELECT
                pc.consultation_id,
                pc.patient_id,
                pc.consultation_date,
                COUNT(cs.symptom_id) AS symptom_count
            FROM public.patient_consultations pc
            LEFT JOIN public.consultation_symptoms cs
                ON cs.consultation_id =
                   pc.consultation_id
            WHERE pc.patient_id = $1
            GROUP BY
                pc.consultation_id,
                pc.patient_id,
                pc.consultation_date
            ORDER BY
                pc.consultation_date DESC;
            `,
            [patient_id]
          );

        return consultationResult.rows;
      } catch (error) {
        app.log.error(error);

        return reply.status(500).send({
          error:
            "Failed to load patient history",
        });
      }
    }
  );

  /*
   * ============================================================
   * PATIENT - CURRENT PATIENT HISTORY
   * ============================================================
   */

  app.get(
    "/api/patient/history",
    async (request, reply) => {
      const user = await requireRole(
        request,
        reply,
        ["patient"]
      );

      if (!user) {
        return;
      }

      if (!user.patient_id) {
        return reply.status(403).send({
          error:
            "Patient account is not linked to a patient",
        });
      }

      try {
        const result = await db.query(
          `
          SELECT
              pc.consultation_id,
              pc.patient_id,
              pc.consultation_date,
              COUNT(cs.symptom_id) AS symptom_count
          FROM public.patient_consultations pc
          LEFT JOIN public.consultation_symptoms cs
              ON cs.consultation_id =
                 pc.consultation_id
          WHERE pc.patient_id = $1
          GROUP BY
              pc.consultation_id,
              pc.patient_id,
              pc.consultation_date
          ORDER BY
              pc.consultation_date DESC;
          `,
          [user.patient_id]
        );

        return result.rows;
      } catch (error) {
        app.log.error(error);

        return reply.status(500).send({
          error:
            "Failed to load patient history",
        });
      }
    }
  );

  /*
   * ============================================================
   * PATIENT - CURRENT PROFILE
   * ============================================================
   */

  app.get(
    "/api/patient/me",
    async (request, reply) => {
      const user = await requireRole(
        request,
        reply,
        ["patient"]
      );

      if (!user) {
        return;
      }

      if (!user.patient_id) {
        return reply.status(403).send({
          error:
            "Patient account is not linked to a patient",
        });
      }

      try {
        const result = await db.query(
          `
          SELECT
              patient_id,
              first_name,
              last_name,
              date_of_birth
          FROM public.patient_identity
          WHERE patient_id = $1
          LIMIT 1;
          `,
          [user.patient_id]
        );

        if (result.rows.length === 0) {
          return reply.status(404).send({
            error: "Patient not found",
          });
        }

        return result.rows[0];
      } catch (error) {
        app.log.error(error);

        return reply.status(500).send({
          error: "Failed to load patient",
        });
      }
    }
  );

  /*
   * ============================================================
   * PATIENT - UPDATE CURRENT PROFILE
   * ============================================================
   */

  app.put<{
    Body: {
      first_name?: string;
      last_name?: string;
      date_of_birth?: string;
    };
  }>(
    "/api/patient/me",
    async (request, reply) => {
      console.log(
        "PTALK: PUT /api/patient/me called"
      );

      const user = await requireRole(
        request,
        reply,
        ["patient"]
      );

      if (!user) {
        return;
      }

      if (!user.patient_id) {
        return reply.status(403).send({
          error:
            "Patient account is not linked to a patient",
        });
      }

      const {
        first_name,
        last_name,
        date_of_birth,
      } = request.body ?? {};

      /*
       * --------------------------------------------------------
       * Validate first name
       * --------------------------------------------------------
       */

      if (
        typeof first_name !== "string" ||
        !first_name.trim()
      ) {
        return reply.status(400).send({
          error: "First name is required",
        });
      }

      /*
       * --------------------------------------------------------
       * Validate last name
       * --------------------------------------------------------
       */

      if (
        typeof last_name !== "string" ||
        !last_name.trim()
      ) {
        return reply.status(400).send({
          error: "Last name is required",
        });
      }

      /*
       * --------------------------------------------------------
       * Validate date of birth
       * --------------------------------------------------------
       */

      if (
        typeof date_of_birth !== "string" ||
        !date_of_birth.trim()
      ) {
        return reply.status(400).send({
          error: "Date of birth is required",
        });
      }

      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(
          date_of_birth
        )
      ) {
        return reply.status(400).send({
          error:
            "Date of birth must use YYYY-MM-DD format",
        });
      }

      /*
       * --------------------------------------------------------
       * Update patient_identity
       * --------------------------------------------------------
       */

      try {
        const result = await db.query(
          `
          UPDATE public.patient_identity
          SET
              first_name = $1,
              last_name = $2,
              date_of_birth = $3,
              updated_at = NOW()
          WHERE patient_id = $4
          RETURNING
              patient_id,
              first_name,
              last_name,
              date_of_birth;
          `,
          [
            first_name.trim(),
            last_name.trim(),
            date_of_birth,
            user.patient_id,
          ]
        );

        if (result.rows.length === 0) {
          return reply.status(404).send({
            error: "Patient not found",
          });
        }

        return result.rows[0];
      } catch (error) {
        app.log.error(
          error,
          "Failed to update patient profile"
        );

        return reply.status(500).send({
          error: "Failed to update patient",
        });
      }
    }
  );

  console.log(
    "PTALK: PUT /api/patient/me registered"
  );
}