import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = "http://localhost:4000";
const N8N_WEBHOOK_URL =
  process.env.N8N_CONSULTATION_WEBHOOK_URL;

export async function POST(request: Request) {
  try {
    console.log(
      "=========================================="
    );
    console.log(
      "PTALK CONSULTATION: POST received"
    );
    console.log(
      "=========================================="
    );

    /*
     * ============================================================
     * 1. GET SESSION COOKIE
     * ============================================================
     */

    const cookieStore = await cookies();

    const sessionCookie =
      cookieStore.get("ptalk_session");

    console.log(
      "PTALK CONSULTATION: session cookie exists:",
      Boolean(sessionCookie?.value)
    );

    if (!sessionCookie?.value) {
      console.error(
        "PTALK CONSULTATION: NO SESSION COOKIE"
      );

      return NextResponse.json(
        {
          error:
            "Unauthorized: no session cookie",
        },
        {
          status: 401,
        }
      );
    }

    const sessionToken =
      sessionCookie.value;

    /*
     * ============================================================
     * 2. ASK BACKEND WHO IS LOGGED IN
     * ============================================================
     *
     * Send the session as BOTH:
     *
     *   Authorization: Bearer ...
     *
     * and
     *
     *   Cookie: ptalk_session=...
     *
     * This removes ambiguity between the two authentication paths.
     */

    console.log(
      "PTALK CONSULTATION: checking backend authentication..."
    );

    const authResponse = await fetch(
      `${BACKEND_URL}/api/auth/me`,
      {
        method: "GET",

        headers: {
          Authorization:
            `Bearer ${sessionToken}`,

          Cookie:
            `ptalk_session=${sessionToken}`,
        },

        cache: "no-store",
      }
    );

    const authText =
      await authResponse.text();

    console.log(
      "PTALK CONSULTATION: backend auth status:",
      authResponse.status
    );

    console.log(
      "PTALK CONSULTATION: backend auth response:",
      authText
    );

    /*
     * ============================================================
     * 3. PARSE BACKEND RESPONSE
     * ============================================================
     */

    let authData: {
      user?: {
        id: string;
        role: string;
        patient_id: string | null;
      };
      error?: string;
    } = {};

    try {
      authData = authText
        ? JSON.parse(authText)
        : {};
    } catch {
      console.error(
        "PTALK CONSULTATION: backend returned invalid JSON:",
        authText
      );
    }

    /*
     * ============================================================
     * 4. BACKEND AUTH FAILED
     * ============================================================
     */

    if (!authResponse.ok) {
      console.error(
        "PTALK CONSULTATION: authentication failed"
      );

      return NextResponse.json(
        {
          error:
            authData.error ||
            "Authentication failed",

          backend_status:
            authResponse.status,

          backend_response:
            authText,
        },
        {
          status:
            authResponse.status,
        }
      );
    }

    /*
     * ============================================================
     * 5. GET USER
     * ============================================================
     */

    const user =
      authData.user;

    console.log(
      "PTALK CONSULTATION: authenticated user:",
      user
    );

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Authentication succeeded but no user was returned.",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * ============================================================
     * 6. ONLY PATIENTS MAY CREATE CONSULTATIONS
     * ============================================================
     */

    if (
      user.role !== "patient"
    ) {
      console.error(
        "PTALK CONSULTATION: user is not a patient:",
        user.role
      );

      return NextResponse.json(
        {
          error:
            "Only patients can submit consultations.",
        },
        {
          status: 403,
        }
      );
    }

    /*
     * ============================================================
     * 7. GET PATIENT ID FROM AUTHENTICATED USER
     * ============================================================
     *
     * IMPORTANT:
     *
     * We DO NOT accept patient_id from the browser.
     *
     * The patient_id comes from the authenticated
     * ptalk_users record.
     */

    const patientId =
      user.patient_id;

    console.log(
      "PTALK CONSULTATION: authenticated patient_id:",
      patientId
    );

    if (!patientId) {
      return NextResponse.json(
        {
          error:
            "No patient identity is associated with this account.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ============================================================
     * 8. READ MULTIPART FORM DATA
     * ============================================================
     */

    const formData =
      await request.formData();

    const audio =
      formData.get("audio");

    console.log(
      "PTALK CONSULTATION: audio received:",
      audio instanceof File
        ? {
            name: audio.name,
            type: audio.type,
            size: audio.size,
          }
        : null
    );

    if (!(audio instanceof File)) {
      return NextResponse.json(
        {
          error:
            "No audio file was provided.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ============================================================
     * 9. VALIDATE AUDIO
     * ============================================================
     */

    if (audio.size <= 0) {
      return NextResponse.json(
        {
          error:
            "The audio file is empty.",
        },
        {
          status: 400,
        }
      );
    }

    const maxSize =
      50 * 1024 * 1024;

    if (audio.size > maxSize) {
      return NextResponse.json(
        {
          error:
            "The audio file must be smaller than 50 MB.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ============================================================
     * 10. CHECK N8N CONFIGURATION
     * ============================================================
     */

    if (!N8N_WEBHOOK_URL) {
      console.error(
        "PTALK CONSULTATION: N8N_CONSULTATION_WEBHOOK_URL is missing"
      );

      return NextResponse.json(
        {
          error:
            "Consultation service is not configured.",
        },
        {
          status: 500,
        }
      );
    }

    console.log(
      "PTALK CONSULTATION: n8n webhook configured"
    );

    /*
     * ============================================================
     * 11. CREATE N8N REQUEST
     * ============================================================
     */

    const n8nFormData =
  new FormData();

n8nFormData.append(
  "audio",
  audio,
  audio.name
);

n8nFormData.append(
  "patient_id",
  patientId
);

console.log(
  "PTALK CONSULTATION: FormData patient_id:",
  patientId
);

    /*
     * ============================================================
     * 12. SEND TO N8N
     * ============================================================
     */

    const n8nResponse = await fetch(
  N8N_WEBHOOK_URL,
  {
    method: "POST",

    headers: {
      "x-ptalk-patient-id": patientId,
    },

    body: n8nFormData,

    cache: "no-store",
  }
);

    const n8nText =
      await n8nResponse.text();

    console.log(
      "PTALK CONSULTATION: n8n status:",
      n8nResponse.status
    );

    console.log(
      "PTALK CONSULTATION: n8n response:",
      n8nText
    );

    /*
     * ============================================================
     * 13. PARSE N8N RESPONSE
     * ============================================================
     */

    let n8nData: {
      consultation_id?: string;
      message?: string;
      error?: string;
    } = {};

    try {
      n8nData = n8nText
        ? JSON.parse(n8nText)
        : {};
    } catch {
      n8nData = {
        message: n8nText,
      };
    }

    /*
     * ============================================================
     * 14. N8N ERROR
     * ============================================================
     */

    if (!n8nResponse.ok) {
      console.error(
        "PTALK CONSULTATION: n8n processing failed"
      );

      return NextResponse.json(
        {
          error:
            n8nData.error ||
            n8nData.message ||
            "n8n processing failed.",

          n8n_status:
            n8nResponse.status,
        },
        {
          status: 502,
        }
      );
    }

    /*
     * ============================================================
     * 15. SUCCESS
     * ============================================================
     */

    console.log(
      "PTALK CONSULTATION: SUCCESS"
    );

    return NextResponse.json(
      {
        success: true,

        message:
          "Consultation submitted successfully.",

        consultation_id:
          n8nData.consultation_id ??
          null,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "=========================================="
    );

    console.error(
      "PTALK CONSULTATION ERROR:",
      error
    );

    console.error(
      "=========================================="
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to submit consultation.",
      },
      {
        status: 500,
      }
    );
  }
}