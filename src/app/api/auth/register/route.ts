import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      first_name,
      last_name,
      date_of_birth,
      email,
      password,
    } = body;

    if (
      !first_name ||
      !last_name ||
      !date_of_birth ||
      !email ||
      !password
    ) {
      return NextResponse.json(
        {
          error:
            "first_name, last_name, date_of_birth, email and password are required",
        },
        {
          status: 400,
        }
      );
    }

    const response = await fetch(
      "http://localhost:4000/api/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name,
          last_name,
          date_of_birth,
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
          error:
            data.error || "Registration failed",
        },
        {
          status: response.status,
        }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        {
          error:
            "Registration succeeded but no user was returned",
        },
        {
          status: 500,
        }
      );
    }

    const setCookie = response.headers.get(
      "set-cookie"
    );

    if (!setCookie) {
      console.error(
        "Backend registration did not return Set-Cookie"
      );

      return NextResponse.json(
        {
          error:
            "Registration succeeded but no session cookie was returned",
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
      console.error(
        "Backend registration returned an invalid session cookie"
      );

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

    const nextResponse = NextResponse.json(
      {
        user: data.user,
        patient: data.patient,
      },
      {
        status: 201,
      }
    );

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
    console.error(
      "Registration API error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to register",
        details: String(error),
      },
      {
        status: 500,
      }
    );
  }
}