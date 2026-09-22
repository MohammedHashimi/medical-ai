import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
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

    const url =
      "http://localhost:5678/webhook/ptalk/patient/history" +
      `?patient_id=${encodeURIComponent(user.patient_id)}`;

    console.log("Calling n8n:", url);

    const response = await fetch(url, {
      cache: "no-store",
    });

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

    return NextResponse.json(JSON.parse(text));
  } catch (error) {
    console.error("History API error:", error);

    return NextResponse.json(
      {
        error: "Failed to load patient history",
        details: String(error),
      },
      { status: 500 }
    );
  }
}