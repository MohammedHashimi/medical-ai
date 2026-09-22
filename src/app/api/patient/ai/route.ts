import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const N8N_PATIENT_ASK_URL =
  "http://localhost:5678/webhook/ptalk/patient/ask";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("ptalk_session");

    if (!session?.value) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const authResponse = await fetch(
      "http://localhost:4000/api/auth/me",
      {
        headers: {
          Cookie: `ptalk_session=${session.value}`,
        },
        cache: "no-store",
      }
    );

    if (!authResponse.ok) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const authData = await authResponse.json();
    const user = authData.user;

    if (!user || user.role !== "patient") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    if (!user.patient_id) {
      return NextResponse.json(
        {
          error:
            "Patient account is not linked to a patient",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const question =
      typeof body.question === "string"
        ? body.question.trim()
        : "";

    if (!question) {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    console.log("PTALK AI QUESTION:", question);
    console.log(
      "PTALK AI PATIENT:",
      user.patient_id
    );

    const n8nResponse = await fetch(
      N8N_PATIENT_ASK_URL,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-ptalk-patient-id": user.patient_id,
        },

        body: JSON.stringify({
          patient_id: user.patient_id,
          question,
        }),

        cache: "no-store",
      }
    );

    const text = await n8nResponse.text();

    console.log(
      "PTALK AI N8N STATUS:",
      n8nResponse.status
    );

    console.log(
      "PTALK AI N8N RESPONSE:",
      text
    );

    if (!n8nResponse.ok) {
      return NextResponse.json(
        {
          error: "AI request failed",
          status: n8nResponse.status,
          response: text,
        },
        { status: 502 }
      );
    }

    let data: unknown;

    try {
      data = JSON.parse(text);
    } catch {
      data = {
        response: text,
      };
    }

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Patient AI API error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to process AI request",
      },
      { status: 500 }
    );
  }
}