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

  try {
    const url = new URL(`${ELEVENLABS_API}/v1/convai/conversation/token`);
    url.searchParams.set("agent_id", agentId);

    const headers: HeadersInit = {};
    if (apiKey) {
      headers["xi-api-key"] = apiKey;
    }

    const response = await fetch(url.toString(), { headers });

    if (!response.ok) {
      const body = await response.text();
      let message = `ElevenLabs returned ${response.status}`;

      if (response.status === 401) {
        message =
          "Agent requires authentication. Add ELEVENLABS_API_KEY to .env (from elevenlabs.io → Profile → API Keys), or enable public access on your agent.";
      } else if (body) {
        try {
          const parsed = JSON.parse(body) as { detail?: { message?: string } };
          message = parsed.detail?.message ?? body;
        } catch {
          message = body.slice(0, 200);
        }
      }

      return NextResponse.json({ error: message }, { status: response.status });
    }

    const data = (await response.json()) as { token?: string };
    if (!data.token) {
      return NextResponse.json(
        { error: "No conversation token received from ElevenLabs." },
        { status: 502 },
      );
    }

    return NextResponse.json({ token: data.token });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch voice token";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
