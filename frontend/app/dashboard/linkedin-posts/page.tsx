"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
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
import {
	ArrowLeft,
	Copy,
	Download,
	Sparkles,
	Hash,
	Github,
} from "lucide-react";

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
		const blob = new Blob([content], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "linkedin-posts.txt";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831] relative overflow-hidden">
			{/* Background decorative elements */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute -top-20 -right-20 md:-top-40 md:-right-40 w-40 h-40 md:w-80 md:h-80 bg-[#76ABAE]/10 rounded-full blur-3xl"></div>
				<div className="absolute -bottom-20 -left-20 md:-bottom-40 md:-left-40 w-40 h-40 md:w-80 md:h-80 bg-[#76ABAE]/5 rounded-full blur-3xl"></div>
				<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-96 md:h-96 bg-[#76ABAE]/5 rounded-full blur-3xl"></div>
			</div>

			<div className="container mx-auto px-4 py-6 relative z-10 max-w-7xl">
				{/* Header with back button */}
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.5 }}
					className="mb-6"
				>
					<Link href="/dashboard">
						<Button
							variant="ghost"
							size="sm"
							className="text-[#EEEEEE] hover:text-[#76ABAE] hover:bg-white/10 transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-[#76ABAE]/30 h-10"
						>
							<ArrowLeft className="mr-2 h-4 w-4" />
							<span className="hidden sm:inline">Back to Dashboard</span>
							<span className="sm:hidden">Back</span>
						</Button>
					</Link>
				</motion.div>

				{/* Modern header with better typography */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.1 }}
					className="text-center mb-8"
				>
					<h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center justify-center gap-3 text-[#EEEEEE] mb-2">
						<Sparkles className="h-8 w-8 text-[#76ABAE]" />
						LinkedIn Post Generator
					</h1>
					<p className="text-[#BBBBBB] text-lg max-w-2xl mx-auto">
						Create engaging LinkedIn posts with AI assistance
					</p>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.2 }}
					className="grid gap-6 md:grid-cols-5"
				>
					<Card className="bg-[#31363F]/80 backdrop-blur-sm border-[#76ABAE]/20 shadow-2xl md:col-span-2 hover:shadow-3xl transition-shadow duration-300">
						<CardHeader>
							<CardTitle className="text-lg text-[#EEEEEE] flex items-center gap-2">
								<Sparkles className="h-5 w-5 text-[#76ABAE]" />
								Post Parameters
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4 text-sm">
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
									onChange={(e) => update("mimic_examples", e.target.value)}
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
							<Button
								onClick={generate}
								disabled={isGenerating}
								className="w-full bg-[#76ABAE] hover:bg-[#76ABAE]/90 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
							>
								{isGenerating ? (
									<Loader variant="spinner" size="sm" className="mr-2" />
								) : (
									<Sparkles className="h-4 w-4 mr-2" />
								)}
								{isGenerating ? "Generating..." : "Generate Posts"}
							</Button>
							<p className="text-[11px] text-[#888] leading-relaxed">
								This tool bridges to the backend endpoint{" "}
								<code className="text-[#76ABAE]">
									/api/v1/linkedin/generate-posts
								</code>
								. Patterns reused from Cold Mail & Hiring Assistant modules for
								consistency.
							</p>
						</CardContent>
					</Card>

					<Card className="bg-[#31363F]/80 backdrop-blur-sm border-[#76ABAE]/20 shadow-2xl md:col-span-3 relative hover:shadow-3xl transition-shadow duration-300">
						<CardHeader className="flex flex-row items-center justify-between">
							<CardTitle className="text-lg text-[#EEEEEE] flex items-center gap-2">
								<Hash className="h-5 w-5 text-[#76ABAE]" /> Generated Posts
							</CardTitle>
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									disabled={!posts.length}
									onClick={downloadAll}
									className="border-[#76ABAE]/50 text-[#76ABAE] hover:bg-[#76ABAE]/10 backdrop-blur-sm"
								>
									<Download className="h-4 w-4 mr-1" />
									All
								</Button>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							{!posts.length && !isGenerating && (
								<div className="text-sm text-[#AAAAAA] p-6 border border-dashed border-[#76ABAE]/30 rounded-md text-center bg-[#222831]/20">
									No posts yet. Configure parameters then click Generate.
								</div>
							)}
							<AnimatePresence>
								{isGenerating && (
									<motion.div
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										className="flex items-center gap-3 text-sm text-[#AAAAAA] p-4 border border-[#76ABAE]/30 rounded-md bg-[#222831]/20"
									>
										<Loader variant="pulse" size="sm" /> Generating posts...
									</motion.div>
								)}
							</AnimatePresence>
							<div className="space-y-4">
								{posts.map((p, i) => (
									<motion.div
										key={i}
										initial={{ opacity: 0, y: 8 }}
										animate={{ opacity: 1, y: 0 }}
										className="bg-[#222831]/50 backdrop-blur-sm rounded-lg p-4 border border-[#76ABAE]/20 shadow-lg space-y-3"
									>
										<div className="flex items-center justify-between">
											<h3 className="text-sm font-semibold tracking-wide uppercase text-[#76ABAE]">
												Post {i + 1}
											</h3>
											<div className="flex gap-2">
												<Button
													size="sm"
													variant="outline"
													onClick={() => copyPost(p)}
													className="border-[#76ABAE]/50 text-[#76ABAE] hover:bg-[#76ABAE]/10 backdrop-blur-sm"
												>
													<Copy className="h-4 w-4" />
												</Button>
											</div>
										</div>
										<p className="whitespace-pre-wrap text-sm leading-relaxed">
											{p.text}
										</p>
										{p.hashtags && p.hashtags.length > 0 && (
											<div className="flex flex-wrap gap-1">
												{p.hashtags.map((h) => (
													<Badge
														key={h}
														variant="outline"
														className="bg-[#31363F]/80 border-[#76ABAE]/40 text-[#76ABAE] hover:bg-[#76ABAE]/10 text-xs"
													>
														#{h.replace(/^#/, "")}
													</Badge>
												))}
											</div>
										)}
										{p.cta_suggestion && (
											<p className="text-xs italic text-[#CCCCCC]">
												CTA: {p.cta_suggestion}
											</p>
										)}
										{p.sources && p.sources.length > 0 && (
											<div className="text-[11px] text-[#999] space-y-1">
												<p className="font-medium text-[#BBBBBB]">Sources:</p>
												<ul className="list-disc ml-4 space-y-0.5">
													{p.sources.slice(0, 4).map((s) => (
														<li key={s.link}>
															<a
																href={s.link}
																target="_blank"
																className="underline decoration-dotted hover:text-[#76ABAE]"
															>
																{s.title}
															</a>
														</li>
													))}
												</ul>
											</div>
										)}
									</motion.div>
								))}
							</div>
						</CardContent>
					</Card>
				</motion.div>
			</div>
		</div>
	);
}
