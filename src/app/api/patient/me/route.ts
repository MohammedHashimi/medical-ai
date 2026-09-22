import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("ptalk_session");

    if (!session?.value) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const response = await fetch(
      "http://localhost:4000/api/patient/me",
      {
        method: "GET",
        headers: {
          Cookie: `ptalk_session=${session.value}`,
        },
        cache: "no-store",
      }
    );

    const text = await response.text();

    if (!response.ok) {
      console.error(
        "PATIENT PROFILE GET BACKEND ERROR:",
        response.status,
        text
      );

      return NextResponse.json(
        {
          error: "Backend request failed",
          status: response.status,
          response: text,
        },
        {
          status: response.status,
        }
      );
    }

    return NextResponse.json(
      JSON.parse(text),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Patient profile GET error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to load patient profile",
        details: String(error),
      },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(
  request: Request
) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("ptalk_session");

    if (!session?.value) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request.json();

    console.log(
      "PATIENT PROFILE PUT BODY:",
      body
    );

    const response = await fetch(
      "http://localhost:4000/api/patient/me",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Cookie: `ptalk_session=${session.value}`,
        },
        body: JSON.stringify(body),
        cache: "no-store",
      }
    );

    const text = await response.text();

    console.log(
      "PATIENT PROFILE BACKEND RESPONSE:",
      response.status,
      text
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Backend request failed",
          status: response.status,
          response: text,
        },
        {
          status: response.status,
        }
      );
    }

    return NextResponse.json(
      JSON.parse(text),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Patient profile PUT error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to update patient profile",
        details: String(error),
      },
      {
        status: 500,
      }
    );
  }
}