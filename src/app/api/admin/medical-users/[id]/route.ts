import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL =
  "http://localhost:4000";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function getSessionCookie() {
  const cookieStore =
    await cookies();

  return cookieStore.get(
    "ptalk_session"
  );
}

async function handleAction(
  request: Request,
  context: RouteContext,
  action: "approve" | "reject"
) {
  try {
    const { id } =
      await context.params;

    const session =
      await getSessionCookie();

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
        `${BACKEND_URL}/api/admin/medical-users/${encodeURIComponent(
          id
        )}/${action}`,
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
      `Admin medical user ${action} error:`,
      error
    );

    return NextResponse.json(
      {
        error:
          `Failed to ${action} medical team user`,
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: Request,
  context: RouteContext
) {
  const action =
    new URL(request.url).searchParams.get(
      "action"
    );

  if (
    action !== "approve" &&
    action !== "reject"
  ) {
    return NextResponse.json(
      {
        error:
          "Action must be approve or reject",
      },
      {
        status: 400,
      }
    );
  }

  return handleAction(
    request,
    context,
    action
  );
}