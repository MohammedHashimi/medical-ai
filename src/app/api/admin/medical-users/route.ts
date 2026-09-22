import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = "http://localhost:4000";

export async function GET() {
  try {
    const cookieStore = await cookies();

    const session = cookieStore.get("ptalk_session");

    if (!session?.value) {
      return NextResponse.json(
        {
          error: "No ptalk_session cookie",
          source: "nextjs",
        },
        {
          status: 401,
        }
      );
    }

    const response = await fetch(
      `${BACKEND_URL}/api/admin/medical-users`,
      {
        method: "GET",
        headers: {
          Cookie: `ptalk_session=${session.value}`,
        },
        cache: "no-store",
      }
    );

    const text = await response.text();

    let data: unknown;

    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        {
          error: "Backend returned non-JSON",
          backendStatus: response.status,
          backendResponse: text,
        },
        {
          status: 502,
        }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Backend request failed",
          backendStatus: response.status,
          backendResponse: data,
        },
        {
          status: response.status,
        }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(
      "Admin medical users proxy error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to connect to backend",
        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      {
        status: 500,
      }
    );
  }
}