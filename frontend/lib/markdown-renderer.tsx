import React from "react";

/**
 * Simple markdown renderer for descriptions
 * Supports:
 * - **bold text**
 * - [link text](url) - renders as clickable links
 * - * list items
 * - - list items
 * - ## and ### headings
 */

const parseMarkdownText = (text: string) => {
	// Parse [text](url) links and **bold** text
	const parts: (string | JSX.Element)[] = [];
	let currentText = text;
	let lastIndex = 0;

	// Regex for [text](url) and **bold**
	const markdownRegex = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
	let match;

	while ((match = markdownRegex.exec(currentText)) !== null) {
		// Add text before the match
		if (match.index > lastIndex) {
			parts.push(currentText.substring(lastIndex, match.index));
		}

		if (match[1] && match[2]) {
			// Link: [text](url)
			parts.push(
				<a
					key={`link-${parts.length}`}
					href={match[2]}
					target="_blank"
					rel="noopener noreferrer"
					className="text-[#76ABAE] hover:underline font-semibold"
				>
					{match[1]}
				</a>
			);
		} else if (match[3]) {
			// Bold: **text**
			parts.push(
				<strong
					key={`bold-${parts.length}`}
					className="text-[#76ABAE] font-bold"
				>
					{match[3]}
				</strong>
			);
		}

		lastIndex = markdownRegex.lastIndex;
	}

	// Add remaining text
	if (lastIndex < currentText.length) {
		parts.push(currentText.substring(lastIndex));
	}

	return parts.length > 0 ? parts : text;
};

export const renderMarkdown = (text: string): JSX.Element[] => {
	const lines = text.split("\n");
	const result: JSX.Element[] = [];
	let currentList: string[] = [];
	let key = 0;

	const flushList = () => {
		if (currentList.length > 0) {
			result.push(
				<ul key={`ul-${key++}`} className="list-disc ml-4 space-y-1 mb-2">
					{currentList.map((item, i) => (
						<li key={i} className="text-[#EEEEEE]/80">
							{parseMarkdownText(item)}
						</li>
					))}
				</ul>
			);
			currentList = [];
		}
	};

	lines.forEach((line) => {
		const trimmed = line.trim();

		if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
			currentList.push(trimmed.substring(2));
		} else if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
			flushList();
			result.push(
				<p key={`heading-${key++}`} className="font-bold text-[#76ABAE] mb-2">
					{parseMarkdownText(trimmed.replace(/\*\*/g, ""))}
				</p>
			);
		} else if (trimmed.startsWith("###")) {
			flushList();
			result.push(
				<p
					key={`h3-${key++}`}
					className="font-semibold text-[#EEEEEE] mb-2 text-sm"
				>
					{parseMarkdownText(trimmed.replace(/^#+\s*/, ""))}
				</p>
			);
		} else if (trimmed.startsWith("##")) {
			flushList();
			result.push(
				<p
					key={`h2-${key++}`}
					className="font-bold text-[#EEEEEE] mb-3 text-base"
				>
					{parseMarkdownText(trimmed.replace(/^#+\s*/, ""))}
				</p>
			);
		} else if (trimmed) {
			flushList();
			result.push(
				<p
					key={`p-${key++}`}
					className="mb-2 text-[#EEEEEE]/80 leading-relaxed"
				>
					{parseMarkdownText(trimmed)}
				</p>
			);
		}
	});

	flushList();
	return result;
};
