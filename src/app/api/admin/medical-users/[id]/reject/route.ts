import { NextResponse } from "next/server";
import { cookies } from "next/headers";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const cookieStore =
      await cookies();

    const session =
      cookieStore.get(
        "ptalk_session"
      );

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

    const response =
      await fetch(
        `http://localhost:4000/api/admin/medical-users/${encodeURIComponent(
          id
        )}/reject`,
        {
          method: "POST",
          headers: {
            Cookie: `ptalk_session=${session.value}`,
          },
          cache: "no-store",
        }
      );

    const text =
      await response.text();

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            "Backend request failed",
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
      "Admin reject error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to reject medical team user",
      },
      {
        status: 500,
      }
    );
  }
}