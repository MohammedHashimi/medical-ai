import { NextResponse } from "next/server";
import { cookies } from "next/headers";

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

    if (user.role !== "patient") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    if (!user.patient_id) {
      return NextResponse.json(
        { error: "Patient account is not linked to a patient" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const question = body.question;

    if (!question) {
      return NextResponse.json(
        {
          error: "Question is required",
        },
        { status: 400 }
      );
    }

    const response = await fetch(
  "http://localhost:5678/webhook/ptalk/patient/ask",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      patient_id: user.patient_id,
      question,
    }),
    cache: "no-store",
  }
);

    const text = await response.text();

    console.log("n8n status:", response.status);
    console.log("n8n response:", text);

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "n8n request failed",
          status: response.status,
          response: text,
        },
        { status: 500 }
      );
    }

    const data = JSON.parse(text);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Ask PTalk API error:", error);

    return NextResponse.json(
      {
        error: "Failed to ask PTalk",
        details: String(error),
      },
      { status: 500 }
    );
  }
}