import { FastifyInstance } from "fastify";

import { db } from "../database";
import { requireAuth } from "../auth/requireAuth";

export async function consultationRoutes(
  app: FastifyInstance
) {
  app.get<{
    Querystring: {
      consultation_id: string;
    };
  }>(
    "/api/consultations",
    async (request, reply) => {
      /*
       * ============================================================
       * AUTHENTICATION
       * ============================================================
       *
       * Session is resolved centrally through requireAuth().
       */

      const user = await requireAuth(
        request,
        reply
      );

      if (!user) {
        return;
      }

      /*
       * ============================================================
       * CONSULTATION ID
       * ============================================================
       */

      const { consultation_id } =
        request.query;

      if (!consultation_id) {
        return reply.status(400).send({
          error:
            "consultation_id is required",
        });
      }

      try {
        /*
         * ========================================================
         * LOAD CONSULTATION
         * ========================================================
         *
         * Medical team:
         *   Can access any consultation.
         *
         * Patient:
         *   Can ONLY access consultations belonging
         *   to their own patient_id.
         */

        const result = await db.query(
          `
          SELECT
              pc.consultation_id,
              pc.patient_id,
              pc.consultation_date,
              pc.language,
              pc.transcript,
              pc.chief_complaint,
              pc.duration,
              pc.severity,
              pc.relevant_history,
              pc.clinical_summary,
              pc.emergency,
              pc.urgency,
              pc.red_flags,
              pc.emergency_reason,

              COALESCE(
                (
                  SELECT json_agg(
                    json_build_object(
                      'symptom_id',
                        cs.symptom_id,
                      'symptom',
                        s.name,
                      'evidence',
                        cs.evidence,
                      'certainty',
                        cs.certainty
                    )
                  )
                  FROM public.consultation_symptoms cs
                  LEFT JOIN public.symptoms s
                    ON s.id = cs.symptom_id
                  WHERE cs.consultation_id =
                    pc.consultation_id
                ),
                '[]'::json
              ) AS symptoms,

              COALESCE(
                (
                  SELECT json_agg(
                    json_build_object(
                      'disease_id',
                        cdm.disease_id,
                      'disease',
                        d.name,
                      'matching_symptoms',
                        cdm.matching_symptoms,
                      'matched_symptoms',
                        cdm.matched_symptoms
                    )
                  )
                  FROM public.consultation_disease_matches cdm
                  LEFT JOIN public.diseases d
                    ON d.id = cdm.disease_id
                  WHERE cdm.consultation_id =
                    pc.consultation_id
                ),
                '[]'::json
              ) AS disease_matches

          FROM public.patient_consultations pc

          WHERE pc.consultation_id = $1

          AND (
            $2 = 'medical_team'

            OR (
              $2 = 'patient'
              AND pc.patient_id = $3
            )
          )

          LIMIT 1;
          `,
          [
            consultation_id,
            user.role,
            user.patient_id,
          ]
        );

        /*
         * ========================================================
         * ACCESS CHECK
         * ========================================================
         *
         * A consultation that does not belong to the patient
         * is intentionally returned as 404.
         *
         * This prevents patients from retrieving another
         * patient's consultation by changing the ID.
         */

        if (result.rows.length === 0) {
          return reply.status(404).send({
            error:
              "Consultation not found",
          });
        }

        return result.rows[0];
      } catch (error) {
        app.log.error(error);

        return reply.status(500).send({
          error:
            "Failed to load consultation",
        });
      }
    }
  );
}