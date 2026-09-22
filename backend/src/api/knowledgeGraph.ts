import { FastifyInstance } from "fastify";

import { db } from "../database";
import { requireRole } from "../auth/requireAuth";

export async function knowledgeGraphRoutes(
  app: FastifyInstance
) {
  app.get(
    "/api/team/knowledge-graph",
    async (request, reply) => {
      /*
       * ============================================================
       * AUTHENTICATION
       * ============================================================
       *
       * Only medical_team users are allowed to access
       * the knowledge graph.
       *
       * requireRole() handles:
       *
       *   - missing session
       *   - invalid session
       *   - wrong role
       */

      const user = await requireRole(
        request,
        reply,
        ["medical_team"]
      );

      if (!user) {
        return;
      }

      try {
        /*
         * ========================================================
         * KNOWLEDGE GRAPH
         * ========================================================
         *
         * Existing knowledge graph query.
         */

        const result = await db.query(`
          SELECT
              pc.patient_id,
              pc.consultation_id,
              pc.consultation_date,

              cs.symptom_id,
              s.name AS symptom,

              cdm.disease_id,
              d.name AS disease,
              cdm.matching_symptoms,
              cdm.matched_symptoms

          FROM public.patient_consultations pc

          LEFT JOIN public.consultation_symptoms cs
              ON cs.consultation_id =
                 pc.consultation_id

          LEFT JOIN public.symptoms s
              ON s.id = cs.symptom_id

          LEFT JOIN public.consultation_disease_matches cdm
              ON cdm.consultation_id =
                 pc.consultation_id

          LEFT JOIN public.diseases d
              ON d.id = cdm.disease_id

          ORDER BY
              pc.consultation_date DESC,
              pc.patient_id,
              cs.symptom_id,
              cdm.disease_id;
        `);

        return result.rows;
      } catch (error) {
        app.log.error(error);

        return reply.status(500).send({
          error:
            "Failed to load knowledge graph",
        });
      }
    }
  );
}