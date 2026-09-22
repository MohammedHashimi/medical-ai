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
      "http://localhost:4000/api/team/patients",
      {
        headers: {
          Cookie: `ptalk_session=${session.value}`,
        },
        cache: "no-store",
      }
    );

    const text = await response.text();

    if (!response.ok) {
      console.error(
        "Backend patients error:",
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

    const data = JSON.parse(text);

    return NextResponse.json(data);
  } catch (error) {
    console.error(
      "Team patients API error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to load patients",
        details: String(error),
      },
      {
        status: 500,
      }
    );
  }
}