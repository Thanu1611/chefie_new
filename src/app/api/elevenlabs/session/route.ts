import { NextResponse } from "next/server";

const ELEVENLABS_API = "https://api.elevenlabs.io";

export async function GET() {
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_KEY?.trim();
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();

  if (!agentId) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_ELEVENLABS_AGENT_KEY is not set." },
      { status: 500 },
    );
  }

  if (!apiKey) {
    return NextResponse.json({
      connectionType: "websocket",
      signedUrl: null,
    });
  }

  try {
    const url = new URL(`${ELEVENLABS_API}/v1/convai/conversation/get-signed-url`);
    url.searchParams.set("agent_id", agentId);

    const response = await fetch(url.toString(), {
      headers: { "xi-api-key": apiKey },
    });

    if (!response.ok) {
      const body = await response.text();
      return NextResponse.json(
        {
          connectionType: "websocket",
          signedUrl: null,
          warning: body.slice(0, 200) || `Signed URL request failed (${response.status})`,
        },
        { status: 200 },
      );
    }

    const data = (await response.json()) as { signed_url?: string };
    return NextResponse.json({
      connectionType: "websocket",
      signedUrl: data.signed_url ?? null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch signed URL";
    return NextResponse.json(
      { connectionType: "websocket", signedUrl: null, warning: message },
      { status: 200 },
    );
  }
}
