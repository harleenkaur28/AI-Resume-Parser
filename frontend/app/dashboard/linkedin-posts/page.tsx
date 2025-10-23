"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import { PageLoader } from "@/components/ui/page-loader";
import LoadingOverlay from "@/components/cold-mail/LoadingOverlay";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Copy, Download, Hash, Github } from "lucide-react";
import { renderMarkdown } from "@/lib/markdown-renderer";

interface GeneratedPost {
	text: string;
	hashtags?: string[];
	cta_suggestion?: string;
	sources?: { title: string; link: string }[];
	github_project_name?: string;
}

export default function LinkedInPostsGenerator() {
	const { toast } = useToast();
	const [isGenerating, setIsGenerating] = useState(false);
	const [isPageLoading, setIsPageLoading] = useState(true);
	const [posts, setPosts] = useState<GeneratedPost[]>([]);
	const [form, setForm] = useState({
		topic: "",
		tone: "Professional",
		audience: "",
		length: "Medium",
		hashtags_option: "suggest",
		cta_text: "",
		mimic_examples: "",
		language: "",
		post_count: 3,
		emoji_level: 1,
		github_project_url: "",
		enable_research: true,
	});

	const update = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

	useEffect(() => {
		// Small delay to allow for potential future data prefetch (mirrors cold-mail pattern)
		const t = setTimeout(() => setIsPageLoading(false), 120);
		return () => clearTimeout(t);
	}, []);

	const generate = async () => {
		if (!form.topic.trim()) {
			toast({
				title: "Topic required",
				variant: "destructive",
				description: "Please enter a topic.",
			});
			return;
		}
		setIsGenerating(true);
		setPosts([]);
		try {
			const res = await fetch("/api/linkedin-post-generator", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(form),
			});
			const data = await res.json();
			if (!res.ok || !data.success) {
				throw new Error(data.message || "Failed to generate posts");
			}
			setPosts(data.posts);
			toast({
				title: "Posts generated",
				description: `${data.posts.length} posts ready.`,
			});
		} catch (e) {
			toast({
				title: "Generation failed",
				description: (e as Error).message,
				variant: "destructive",
			});
		} finally {
			setIsGenerating(false);
		}
	};

	const processPostContent = (post: GeneratedPost) => {
		// Extract hashtags from the last paragraph and move them to hashtags array
		const paragraphs = post.text.split("\n\n").filter((p) => p.trim());
		const lastParagraph = paragraphs[paragraphs.length - 1];

		// Find hashtags in the last paragraph
		const hashtagRegex = /#[a-zA-Z0-9_]+/g;
		const extractedHashtags = lastParagraph.match(hashtagRegex) || [];

		let cleanedText = post.text;
		let updatedHashtags = [...(post.hashtags || [])];

		if (extractedHashtags.length > 0) {
			// Remove hashtags from the last paragraph
			const cleanedLastParagraph = lastParagraph
				.replace(hashtagRegex, "")
				.replace(/\s+/g, " ")
				.trim();

			// Reconstruct the text without hashtags in the last paragraph
			const otherParagraphs = paragraphs.slice(0, -1);
			if (cleanedLastParagraph) {
				cleanedText = [...otherParagraphs, cleanedLastParagraph].join("\n\n");
			} else {
				cleanedText = otherParagraphs.join("\n\n");
			}

			// Add extracted hashtags to the hashtags array (remove # prefix for consistency)
			const newHashtags = extractedHashtags.map((tag) => tag.replace("#", ""));
			updatedHashtags = Array.from(
				new Set([...updatedHashtags, ...newHashtags])
			); // Remove duplicates
		}

		return {
			...post,
			text: cleanedText.trim(),
			hashtags: updatedHashtags,
		};
	};

	const copyPost = async (p: GeneratedPost) => {
		try {
			const text = `${p.text}\n\n${p.hashtags
				?.map((h) => `#${h.replace(/^#/, "")}`)
				.join(" ")}${p.cta_suggestion ? `\n\nCTA: ${p.cta_suggestion}` : ""}`;
			await navigator.clipboard.writeText(text.trim());
			toast({ title: "Copied", description: "Post copied to clipboard" });
		} catch {
			toast({ title: "Copy failed", variant: "destructive" });
		}
	};

	const downloadAll = () => {
		if (!posts.length) return;
		const content = posts
			.map(
				(p, i) =>
					`Post ${i + 1}:\n${p.text}\nHashtags: ${(p.hashtags || [])
						.map((h) => `#${h.replace(/^#/, "")}`)
						.join(" ")}\n${
						p.cta_suggestion ? `CTA: ${p.cta_suggestion}` : ""
					}\n`
			)
			.join("\n-------------------------\n");
		const blob = new Blob([content], { type: "text/markdown" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "linkedin-posts.md";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	return (
		<>
			<PageLoader
				isPageLoading={isPageLoading}
				text="Loading LinkedIn Post Generator..."
			/>
			{!isPageLoading && (
				<div className="min-h-screen bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831]">
					{/* Mobile-optimized container */}
					<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
						{/* Back button - better mobile positioning */}
						<motion.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.5 }}
							className="mb-6 sm:mb-8"
						>
							<Link href="/dashboard">
								<Button
									variant="ghost"
									size="sm"
									className="text-[#EEEEEE] hover:text-[#76ABAE] hover:bg-white/5 transition-all duration-300 p-2 sm:p-3"
								>
									<ArrowLeft className="mr-2 h-4 w-4" />
									<span className="hidden sm:inline">Back to Dashboard</span>
									<span className="sm:hidden">Back</span>
								</Button>
							</Link>
						</motion.div>

						<div className="max-w-7xl mx-auto">
							{/* Modern header with better mobile typography */}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.8, delay: 0.2 }}
								className="text-center mb-8 sm:mb-12"
							>
								<div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#76ABAE]/20 to-[#76ABAE]/10 rounded-2xl mb-4 sm:mb-6 shadow-lg">
									<Hash className="h-8 w-8 sm:h-10 sm:w-10 text-[#76ABAE]" />
								</div>
								<h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#EEEEEE] mb-3 sm:mb-4 leading-tight">
									LinkedIn Post Generator
								</h1>
								<p className="text-[#EEEEEE]/70 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed px-4">
									Create engaging LinkedIn posts with AI assistance to build
									your professional network.
								</p>
							</motion.div>

							{/* Responsive grid - stack on mobile */}
							<div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
								{/* Input Form - Modern design */}
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.8, delay: 0.4 }}
									className="order-1"
								>
									<Card className="relative backdrop-blur-lg bg-white/5 border-white/10 shadow-2xl overflow-hidden">
										<CardHeader className="pb-4">
											<CardTitle className="text-[#EEEEEE] text-xl sm:text-2xl font-semibold">
												Post Parameters
											</CardTitle>
											<p className="text-[#EEEEEE]/60 text-sm">
												Configure your LinkedIn post generation settings
											</p>
										</CardHeader>
										<CardContent className="space-y-6">
											{/* Section: Core Topic & Audience */}
											<div className="space-y-4 pb-2 border-b border-[#76ABAE]/10">
												<div>
													<Label className="mb-1 block text-[#EEEEEE] font-medium">
														Topic *
													</Label>
													<Input
														value={form.topic}
														onChange={(e) => update("topic", e.target.value)}
														placeholder="e.g. Remote team productivity"
														className="bg-[#222831]/50 border-[#76ABAE]/30 text-[#EEEEEE] placeholder:text-[#AAAAAA] focus:border-[#76ABAE] focus:ring-1 focus:ring-[#76ABAE]/50"
													/>
												</div>
												<div>
													<Label className="mb-1 block text-[#EEEEEE] font-medium">
														Tone
													</Label>
													<Select
														value={form.tone}
														onValueChange={(value) => update("tone", value)}
													>
														<SelectTrigger className="w-full bg-[#222831]/50 border-[#76ABAE]/30 text-[#EEEEEE] focus:border-[#76ABAE] focus:ring-1 focus:ring-[#76ABAE]/50">
															<SelectValue placeholder="Select tone" />
														</SelectTrigger>
														<SelectContent className="bg-[#31363F] border-[#76ABAE]/30 text-[#EEEEEE] shadow-xl">
															{[
																"Professional",
																"Conversational",
																"Inspirational",
																"Analytical",
																"Friendly",
															].map((t) => (
																<SelectItem
																	key={t}
																	value={t}
																	className="focus:bg-[#76ABAE]/20 focus:text-[#EEEEEE] cursor-pointer"
																>
																	{t}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</div>
												<div>
													<Label className="mb-1 block text-[#EEEEEE] font-medium">
														Audience (comma separated)
													</Label>
													<Input
														value={form.audience}
														onChange={(e) => update("audience", e.target.value)}
														placeholder="Developers, Engineering Managers"
														className="bg-[#222831]/50 border-[#76ABAE]/30 text-[#EEEEEE] placeholder:text-[#AAAAAA] focus:border-[#76ABAE] focus:ring-1 focus:ring-[#76ABAE]/50"
													/>
												</div>
												<div className="grid grid-cols-2 gap-4 pt-2">
													<div>
														<Label className="mb-1 block text-[#EEEEEE] font-medium">
															Length
														</Label>
														<Select
															value={form.length}
															onValueChange={(value) => update("length", value)}
														>
															<SelectTrigger className="w-full bg-[#222831]/50 border-[#76ABAE]/30 text-[#EEEEEE] focus:border-[#76ABAE] focus:ring-1 focus:ring-[#76ABAE]/50">
																<SelectValue placeholder="Select length" />
															</SelectTrigger>
															<SelectContent className="bg-[#31363F] border-[#76ABAE]/30 text-[#EEEEEE] shadow-xl">
																{["Short", "Medium", "Long", "Any"].map((l) => (
																	<SelectItem
																		key={l}
																		value={l}
																		className="focus:bg-[#76ABAE]/20 focus:text-[#EEEEEE] cursor-pointer"
																	>
																		{l}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													</div>
													<div>
														<Label className="mb-1 block text-[#EEEEEE] font-medium">
															Hashtags
														</Label>
														<Select
															value={form.hashtags_option}
															onValueChange={(value) =>
																update("hashtags_option", value)
															}
														>
															<SelectTrigger className="w-full bg-[#222831]/50 border-[#76ABAE]/30 text-[#EEEEEE] focus:border-[#76ABAE] focus:ring-1 focus:ring-[#76ABAE]/50">
																<SelectValue placeholder="Select hashtag option" />
															</SelectTrigger>
															<SelectContent className="bg-[#31363F] border-[#76ABAE]/30 text-[#EEEEEE] shadow-xl">
																{["suggest", "none"].map((o) => (
																	<SelectItem
																		key={o}
																		value={o}
																		className="focus:bg-[#76ABAE]/20 focus:text-[#EEEEEE] capitalize cursor-pointer"
																	>
																		{o}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													</div>
												</div>
											</div>
											{/* end core topic wrapper */}
											<div className="pt-2 space-y-4 border-t border-[#76ABAE]/10">
												<Label className="mb-1 block text-[#EEEEEE] font-medium">
													CTA Text (optional)
												</Label>
												<Input
													value={form.cta_text}
													onChange={(e) => update("cta_text", e.target.value)}
													placeholder="e.g. Share your experience below!"
													className="bg-[#222831]/50 border-[#76ABAE]/30 text-[#EEEEEE] placeholder:text-[#AAAAAA] focus:border-[#76ABAE] focus:ring-1 focus:ring-[#76ABAE]/50"
												/>
											</div>
											<div className="pt-2 space-y-4 border-t border-[#76ABAE]/10">
												<Label className="mb-1 block text-[#EEEEEE] font-medium">
													Mimic Examples (style hints)
												</Label>
												<Textarea
													value={form.mimic_examples}
													onChange={(e) =>
														update("mimic_examples", e.target.value)
													}
													placeholder="Paste a post snippet to emulate style"
													className="bg-[#222831]/50 border-[#76ABAE]/30 text-[#EEEEEE] placeholder:text-[#AAAAAA] focus:border-[#76ABAE] focus:ring-1 focus:ring-[#76ABAE]/50 min-h-[80px]"
												/>
											</div>
											<div className="pt-2 space-y-4 border-t border-[#76ABAE]/10">
												<Label className="mb-1 block text-[#EEEEEE] font-medium">
													Language
												</Label>
												<Input
													value={form.language}
													onChange={(e) => update("language", e.target.value)}
													placeholder="e.g. en, es (auto by default)"
													className="bg-[#222831]/50 border-[#76ABAE]/30 text-[#EEEEEE] placeholder:text-[#AAAAAA] focus:border-[#76ABAE] focus:ring-1 focus:ring-[#76ABAE]/50"
												/>
											</div>
											<div className="pt-2 space-y-4 border-t border-[#76ABAE]/10">
												<div>
													<Label className="mb-1 flex items-center gap-2 text-[#EEEEEE] font-medium">
														GitHub Project URL{" "}
														<Github className="h-4 w-4 text-[#76ABAE]" />
													</Label>
													<Input
														value={form.github_project_url}
														onChange={(e) =>
															update("github_project_url", e.target.value)
														}
														placeholder="https://github.com/your/repo"
														className="bg-[#222831]/50 border-[#76ABAE]/30 text-[#EEEEEE] placeholder:text-[#AAAAAA] focus:border-[#76ABAE] focus:ring-1 focus:ring-[#76ABAE]/50"
													/>
												</div>
												<div className="space-y-2 pt-2 border-t border-[#76ABAE]/10">
													<Label className="flex justify-between text-xs uppercase tracking-wide text-[#AAAAAA]">
														Post Count{" "}
														<span className="text-[#76ABAE] font-semibold">
															{form.post_count}
														</span>
													</Label>
													<Slider
														value={[form.post_count]}
														min={1}
														max={5}
														step={1}
														onValueChange={(v) => update("post_count", v[0])}
													/>
												</div>
												<div className="space-y-2 pt-2 border-t border-[#76ABAE]/10">
													<Label className="flex justify-between text-xs uppercase tracking-wide text-[#AAAAAA]">
														Emoji Level{" "}
														<span className="text-[#76ABAE] font-semibold">
															{form.emoji_level}
														</span>
													</Label>
													<Slider
														value={[form.emoji_level]}
														min={0}
														max={3}
														step={1}
														onValueChange={(v) => update("emoji_level", v[0])}
													/>
												</div>
												<div className="flex items-center justify-between border border-[#76ABAE]/30 rounded-md px-3 py-2 bg-[#222831]/20 mt-2">
													<div>
														<p className="text-sm font-medium text-[#EEEEEE]">
															Enable Research
														</p>
														<p className="text-xs text-[#BBBBBB]">
															Enhance posts with current insights
														</p>
													</div>
													<Switch
														checked={form.enable_research}
														onCheckedChange={(checked) =>
															update("enable_research", checked)
														}
														className="data-[state=checked]:bg-[#76ABAE] data-[state=unchecked]:bg-[#444]"
													/>
												</div>
											</div>
											{/* end advanced settings wrapper */}
											{/* Enhanced generate button with advanced loader */}
											<motion.div
												whileHover={{ scale: 1.01 }}
												whileTap={{ scale: 0.99 }}
											>
												<Button
													onClick={generate}
													disabled={isGenerating || !form.topic.trim()}
													className="relative w-full h-14 bg-gradient-to-r from-[#76ABAE] to-[#76ABAE]/80 hover:from-[#76ABAE]/90 hover:to-[#76ABAE]/70 text-white font-semibold rounded-xl transition-all duration-300 overflow-hidden group disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
												>
													{/* Animated background for loading state */}
													{isGenerating && (
														<div className="absolute inset-0 bg-gradient-to-r from-[#76ABAE]/20 via-[#76ABAE]/40 to-[#76ABAE]/20 animate-pulse"></div>
													)}

													{/* Button content */}
													<div className="relative z-10 flex items-center justify-center">
														{isGenerating ? (
															<>
																<div className="flex items-center space-x-3">
																	<div className="relative">
																		<Loader
																			variant="spinner"
																			size="sm"
																			className="text-white"
																		/>
																		{/* Additional spinning ring */}
																		<div className="absolute inset-0 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
																	</div>
																	<div className="flex flex-col items-start">
																		<span className="text-sm font-medium">
																			Generating your posts...
																		</span>
																		<span className="text-xs text-white/80">
																			This may take a few moments
																		</span>
																	</div>
																</div>
															</>
														) : (
															<>
																<Hash className="mr-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
																<span className="text-base">
																	Generate Posts
																</span>
															</>
														)}
													</div>

													{/* Subtle shine effect on hover */}
													<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>

													{/* Progress indicator for loading */}
													{isGenerating && (
														<div className="absolute bottom-0 left-0 h-1 bg-white/30 animate-pulse w-full">
															<div className="h-full bg-white/60 animate-pulse"></div>
														</div>
													)}
												</Button>
											</motion.div>
										</CardContent>
									</Card>
								</motion.div>

								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.8, delay: 0.6 }}
									className="order-2"
								>
									<Card className="relative backdrop-blur-lg bg-white/5 border-white/10 shadow-2xl overflow-hidden">
										<CardHeader className="flex flex-row items-center justify-between pb-6">
											<div>
												<CardTitle className="text-[#EEEEEE] text-xl sm:text-2xl font-semibold mb-2 flex items-center gap-3">
													Generated Posts
													{posts.length > 0 && (
														<Badge
															variant="secondary"
															className="bg-[#76ABAE]/20 text-[#76ABAE] border-[#76ABAE]/40 text-xs"
														>
															{posts.length} post{posts.length !== 1 ? "s" : ""}
														</Badge>
													)}
												</CardTitle>
												<p className="text-[#EEEEEE]/60 text-sm">
													{posts.length > 0
														? "Your AI-crafted LinkedIn posts are ready"
														: "Generated posts will appear here"}
												</p>
											</div>
											<div className="flex gap-2">
												<Button
													variant="outline"
													size="sm"
													disabled={!posts.length}
													onClick={downloadAll}
													className="border-[#76ABAE]/50 text-[#76ABAE] hover:bg-[#76ABAE]/10 backdrop-blur-sm transition-all duration-200 hover:scale-105 disabled:opacity-50"
												>
													<Download className="h-4 w-4 mr-1" />
													<span className="hidden sm:inline">All</span>
												</Button>
											</div>
										</CardHeader>
										<CardContent className="space-y-6">
											{!posts.length && !isGenerating && (
												<div className="text-sm text-[#AAAAAA]/80 p-8 border border-dashed border-[#76ABAE]/30 rounded-xl text-center bg-[#222831]/20 backdrop-blur-sm">
													<div className="flex flex-col items-center space-y-3">
														<Hash className="h-8 w-8 text-[#76ABAE]/50" />
														<div>
															<p className="font-medium text-[#EEEEEE]/80">
																No posts yet
															</p>
															<p className="text-xs text-[#AAAAAA]/70 mt-1">
																Configure parameters then click Generate
															</p>
														</div>
													</div>
												</div>
											)}
											<AnimatePresence>
												{isGenerating && (
													<motion.div
														initial={{ opacity: 0, scale: 0.95 }}
														animate={{ opacity: 1, scale: 1 }}
														exit={{ opacity: 0, scale: 0.95 }}
														className="flex items-center gap-4 text-sm text-[#AAAAAA] p-6 border border-[#76ABAE]/30 rounded-xl bg-[#222831]/30 backdrop-blur-sm"
													>
														<div className="flex items-center space-x-3">
															<Loader variant="pulse" size="sm" />
															<div className="animate-spin rounded-full h-4 w-4 border-2 border-[#76ABAE]/30 border-t-[#76ABAE]"></div>
														</div>
														<div>
															<p className="font-medium text-[#EEEEEE]/90">
																Generating posts...
															</p>
															<p className="text-xs text-[#AAAAAA]/70 mt-0.5">
																AI is crafting your LinkedIn content
															</p>
														</div>
													</motion.div>
												)}
											</AnimatePresence>
											<div className="space-y-6">
												{posts.map((p, i) => {
													const processedPost = processPostContent(p);
													return (
														<motion.div
															key={i}
															initial={{ opacity: 0, y: 12 }}
															animate={{ opacity: 1, y: 0 }}
															transition={{ duration: 0.4, delay: i * 0.1 }}
															className="group bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-[#76ABAE]/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-[#76ABAE]/40 space-y-4"
														>
															<div className="flex items-center justify-between mb-4">
																<div className="flex items-center gap-3">
																	<div className="flex items-center justify-center w-8 h-8 bg-[#76ABAE]/10 rounded-lg">
																		<span className="text-sm font-bold text-[#76ABAE]">
																			{i + 1}
																		</span>
																	</div>
																	<h3 className="text-sm font-semibold tracking-wide uppercase text-[#76ABAE]/90">
																		POST {i + 1}
																	</h3>
																</div>
																<Button
																	size="sm"
																	variant="outline"
																	onClick={() => copyPost(processedPost)}
																	className="opacity-0 group-hover:opacity-100 transition-all duration-200 border-[#76ABAE]/50 text-[#76ABAE] hover:bg-[#76ABAE]/10 hover:border-[#76ABAE] backdrop-blur-sm hover:scale-105"
																>
																	<Copy className="h-4 w-4 mr-1.5" />
																	<span className="text-xs">Copy</span>
																</Button>
															</div>

															<div className="bg-[#222831]/40 rounded-lg p-4 border border-[#76ABAE]/10">
																<p className="whitespace-pre-wrap text-[#EEEEEE] text-sm leading-relaxed font-medium">
																	{processedPost.text}
																</p>
															</div>

															{processedPost.hashtags &&
																processedPost.hashtags.length > 0 && (
																	<div className="flex flex-wrap gap-2 pt-2">
																		{processedPost.hashtags.map((h, idx) => (
																			<Badge
																				key={idx}
																				variant="outline"
																				className="bg-[#76ABAE]/10 border-[#76ABAE]/40 text-[#76ABAE] hover:bg-[#76ABAE]/20 text-xs font-medium px-2.5 py-1 transition-colors duration-200"
																			>
																				#{h.replace(/^#/, "")}
																			</Badge>
																		))}
																	</div>
																)}

															{processedPost.cta_suggestion && (
																<div className="bg-[#31363F]/60 rounded-lg p-3">
																	<p className="text-xs font-medium text-[#76ABAE]/90 mb-1">
																		CTA SUGGESTION
																	</p>
																	<div className="text-sm text-[#EEEEEE]/90 italic">
																		{renderMarkdown(
																			processedPost.cta_suggestion
																		)}
																	</div>
																</div>
															)}

															{processedPost.sources &&
																processedPost.sources.length > 0 && (
																	<div className="bg-[#31363F]/40 rounded-lg p-3 border border-[#76ABAE]/10">
																		<p className="text-xs font-semibold text-[#76ABAE]/90 mb-2 uppercase tracking-wide">
																			Research Sources
																		</p>
																		<ul className="space-y-1.5">
																			{processedPost.sources
																				.slice(0, 3)
																				.map((s, idx) => (
																					<li
																						key={idx}
																						className="flex items-start gap-2"
																					>
																						<div className="w-1.5 h-1.5 bg-[#76ABAE]/60 rounded-full mt-2 flex-shrink-0"></div>
																						<a
																							href={s.link}
																							target="_blank"
																							rel="noopener noreferrer"
																							className="text-xs text-[#EEEEEE]/80 hover:text-[#76ABAE] transition-colors duration-200 underline decoration-dotted underline-offset-2 line-clamp-2"
																						>
																							{s.title}
																						</a>
																					</li>
																				))}
																		</ul>
																	</div>
																)}
														</motion.div>
													);
												})}
											</div>
										</CardContent>
									</Card>
								</motion.div>
							</div>
						</div>
					</div>
				</div>
			)}
			<LoadingOverlay
				isGenerating={isGenerating}
				isEditing={false}
				generateTitle="Generating LinkedIn Posts"
				generateDescription="AI is crafting engaging LinkedIn posts based on your parameters..."
			/>
		</>
	);
}
