import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

/**
 * LinkedIn Post Generator Bridge API
 * 
 * Bridges frontend requests to the Python backend endpoint:
 *   POST /api/v1/linkedin/generate-posts
 * Referenced patterns: cold-mail & hiring-assistant bridge routes.
 */

interface GeneratedPost {
	text: string;
	hashtags?: string[];
	cta_suggestion?: string | null;
	sources?: Array<{ title: string; link: string }>; // from backend research
	github_project_name?: string | null;
}

interface BackendPostGenerationResponse {
	success: boolean;
	message: string;
	posts: GeneratedPost[];
}

function sanitizeText(t: string): string {
	return t
		.replace(/<[^>]*>/g, "")
		.replace(/&nbsp;/g, " ")
		.trim();
}

function normalizeAudience(audience: any): string[] | undefined {
	if (!audience) return undefined;
	if (Array.isArray(audience)) {
		return audience.map(String).map(a => a.trim()).filter(Boolean);
	}
	if (typeof audience === "string") {
		// Accept JSON array string or comma separated
		const raw = audience.trim();
		try {
			if ((raw.startsWith("[") && raw.endsWith("]")) || (raw.startsWith("\"") && raw.endsWith("\""))) {
				const parsed = JSON.parse(raw);
				if (Array.isArray(parsed)) {
					return parsed.map(String).map(a => a.trim()).filter(Boolean);
				}
			}
		} catch (_) {
			// fall through to comma parsing
		}
		return raw.split(",").map(a => a.trim()).filter(Boolean);
	}
	return undefined;
}

export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user) {
			return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
		}

		let payload: any;
		try {
			payload = await request.json();
		} catch (e) {
			return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
		}

		const {
			topic,
			tone,
			audience,
			length = "Medium",
			hashtags_option = "suggest",
			cta_text,
			mimic_examples,
			language,
			post_count = 3,
			emoji_level = 1,
			github_project_url,
			enable_research = true,
		} = payload;

		if (!topic || typeof topic !== "string" || !topic.trim()) {
			return NextResponse.json({ success: false, message: "'topic' is required" }, { status: 400 });
		}

		// Basic validation bounds
		const pc = Math.min(Math.max(parseInt(post_count, 10) || 3, 1), 5);
		const el = Math.min(Math.max(parseInt(emoji_level, 10) || 1, 0), 3);

		const normalizedAudience = normalizeAudience(audience);

		const backendBody = {
			topic: topic.trim(),
			tone: tone?.trim() || undefined,
			audience: normalizedAudience,
			length,
			hashtags_option,
			cta_text: cta_text?.trim() || undefined,
			mimic_examples: mimic_examples?.trim() || undefined,
			language: language?.trim() || undefined,
			post_count: pc,
			emoji_level: el,
			github_project_url: github_project_url?.trim() || undefined,
			enable_research: !!enable_research,
		};

		const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";

		let backendResponse: Response;
		try {
			backendResponse = await fetch(`${backendUrl}/api/v1/linkedin/generate-posts`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(backendBody),
				signal: AbortSignal.timeout(30000),
			});
		} catch (err) {
			const message = err instanceof Error && err.name === 'AbortError'
				? 'Request to generation service timed out'
				: 'Failed to connect to generation service';
			return NextResponse.json({ success: false, message }, { status: 503 });
		}

		const rawText = await backendResponse.text();
		if (!backendResponse.ok) {
			// Try to extract error detail
			let detail = rawText.slice(0, 200);
			try {
				const errJson = JSON.parse(rawText);
				detail = errJson.message || errJson.detail || detail;
			} catch (_) {}
			return NextResponse.json({ success: false, message: `Backend error: ${detail}` }, { status: backendResponse.status });
		}

		let backendData: BackendPostGenerationResponse;
		try {
			backendData = JSON.parse(rawText);
		} catch (e) {
			return NextResponse.json({ success: false, message: "Invalid response from generation service" }, { status: 502 });
		}

		if (!backendData.posts || !Array.isArray(backendData.posts)) {
			return NextResponse.json({ success: false, message: "Malformed backend response" }, { status: 500 });
		}

		const sanitizedPosts = backendData.posts.map(p => ({
			text: sanitizeText(p.text || ""),
			hashtags: p.hashtags?.map(h => h.trim()).filter(Boolean) || [],
			cta_suggestion: p.cta_suggestion ? sanitizeText(p.cta_suggestion) : undefined,
			sources: p.sources,
			github_project_name: p.github_project_name,
		}));

		return NextResponse.json({
			success: true,
			message: backendData.message || "Posts generated successfully",
			posts: sanitizedPosts,
			meta: { count: sanitizedPosts.length },
		});
	} catch (error) {
		return NextResponse.json({ success: false, message: (error as Error).message || 'Unexpected error' }, { status: 500 });
	}
}

// (Optional) GET endpoint can return supported config defaults for client building UI dynamically.
export async function GET() {
	return NextResponse.json({
		success: true,
		message: "LinkedIn Post Generator config",
		defaults: {
			tones: ["Professional", "Conversational", "Inspirational", "Analytical", "Friendly"],
			lengths: ["Short", "Medium", "Long", "Any"],
			hashtagOptions: ["suggest", "none"],
			emojiLevelRange: { min: 0, max: 3 },
			postCountRange: { min: 1, max: 5 },
		},
		reference: {
			hiringAssistant: "/api/backend-interface/gen-answer",
			coldMail: "/api/backend-interface/cold-mail",
			linkedinPosts: "/api/linkedin-post-generator",
			backendEndpoint: "/api/v1/linkedin/generate-posts",
		},
	});
}

