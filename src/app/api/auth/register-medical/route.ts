import { NextResponse } from "next/server";

const BACKEND_URL = "http://localhost:4000";

export async function POST(
  request: Request
) {
  try {
    const body = await request.json();

    const response = await fetch(
      `${BACKEND_URL}/api/auth/register-medical`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
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
          error:
            "Backend returned an invalid response.",
        },
        {
          status: 502,
        }
      );
    }

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error(
      "Medical registration proxy error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to connect to backend.",
      },
      {
        status: 500,
      }
    );
  }
}