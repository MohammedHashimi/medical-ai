import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("ptalk_session");

    if (session?.value) {
      await fetch(
        "http://localhost:4000/api/auth/logout",
        {
          method: "POST",
          headers: {
            Cookie: `ptalk_session=${session.value}`,
          },
          cache: "no-store",
        }
      );
    }

    const response = NextResponse.json({
      success: true,
    });

    response.cookies.delete("ptalk_session");

    return response;
  } catch (error) {
    console.error("Logout API error:", error);

    return NextResponse.json(
      {
        error: "Logout failed",
      },
      {
        status: 500,
      }
    );
  }
}