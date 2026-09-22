import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        {
          error: "email and password are required",
        },
        {
          status: 400,
        }
      );
    }

    const response = await fetch(
      "http://localhost:4000/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data.error || "Login failed",
        },
        {
          status: response.status,
        }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        {
          error: "Invalid login response",
        },
        {
          status: 500,
        }
      );
    }

    const setCookie = response.headers.get("set-cookie");

    console.log("LOGIN BACKEND STATUS:", response.status);
    console.log("LOGIN BACKEND USER:", data.user);
    console.log(
      "LOGIN BACKEND HAS COOKIE:",
      Boolean(setCookie)
    );

    if (!setCookie) {
      return NextResponse.json(
        {
          error:
            "Login succeeded but no session cookie was returned",
        },
        {
          status: 500,
        }
      );
    }

    const cookieMatch = setCookie.match(
      /ptalk_session=([^;]+)/
    );

    if (!cookieMatch) {
      return NextResponse.json(
        {
          error:
            "Invalid session cookie returned by backend",
        },
        {
          status: 500,
        }
      );
    }

    const sessionToken = cookieMatch[1];

    const nextResponse = NextResponse.json({
      user: data.user,
    });

    nextResponse.cookies.set(
      "ptalk_session",
      sessionToken,
      {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 8,
      }
    );

    return nextResponse;
  } catch (error) {
    console.error("Login API error:", error);

    return NextResponse.json(
      {
        error: "Failed to login",
        details: String(error),
      },
      {
        status: 500,
      }
    );
  }
}