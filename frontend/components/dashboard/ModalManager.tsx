"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import {
	FileText,
	Users,
	Mail,
	User,
	Briefcase,
	Edit,
	Trash2,
	Copy,
	X,
	Calendar,
} from "lucide-react";
import Link from "next/link";

interface Resume {
	id: string;
	customName: string;
	uploadDate: string;
	predictedField?: string;
	candidateName?: string;
}

interface InterviewSession {
	id: string;
	role: string;
	companyName: string;
	createdAt: string;
	questionsAndAnswers: Array<{
		question: string;
		answer: string;
	}>;
}

interface ColdMailSession {
	id: string;
	recipientName: string;
	recipientDesignation: string;
	companyName: string;
	createdAt: string;
	emails: Array<{
		id: string;
		subject: string;
		body: string;
		createdAt: string;
	}>;
}

interface ModalManagerProps {
	// Modal states
	showResumesModal: boolean;
	setShowResumesModal: (show: boolean) => void;
	showInterviewsModal: boolean;
	setShowInterviewsModal: (show: boolean) => void;
	showColdMailsModal: boolean;
	setShowColdMailsModal: (show: boolean) => void;

	// Data states
	resumes: Resume[];
	interviewsData: InterviewSession[];
	coldMailsData: ColdMailSession[];

	// Loading states
	isLoadingData: boolean;
	isLoadingInterviews: boolean;
	isLoadingColdMails: boolean;

	// Edit states
	editingResume: { id: string; name: string } | null;
	setEditingResume: (resume: { id: string; name: string } | null) => void;
	newResumeName: string;
	setNewResumeName: (name: string) => void;

	// Delete states
	deletingResume: { id: string; name: string } | null;
	setDeletingResume: (resume: { id: string; name: string } | null) => void;
	deletingInterview: { id: string; role: string; companyName: string } | null;
	setDeletingInterview: (
		interview: { id: string; role: string; companyName: string } | null
	) => void;
	deletingColdMail: {
		id: string;
		recipientName: string;
		companyName: string;
	} | null;
	setDeletingColdMail: (
		coldMail: { id: string; recipientName: string; companyName: string } | null
	) => void;

	// Handlers
	handleRenameResume: (resumeId: string, newName: string) => void;
	handleDeleteResume: (resumeId: string) => void;
	handleDeleteInterview: (interviewId: string) => void;
	handleDeleteColdMail: (coldMailId: string) => void;
	copyToClipboard: (text: string) => void;
}

export default function ModalManager({
	showResumesModal,
	setShowResumesModal,
	showInterviewsModal,
	setShowInterviewsModal,
	showColdMailsModal,
	setShowColdMailsModal,
	resumes,
	interviewsData,
	coldMailsData,
	isLoadingData,
	isLoadingInterviews,
	isLoadingColdMails,
	editingResume,
	setEditingResume,
	newResumeName,
	setNewResumeName,
	deletingResume,
	setDeletingResume,
	deletingInterview,
	setDeletingInterview,
	deletingColdMail,
	setDeletingColdMail,
	handleRenameResume,
	handleDeleteResume,
	handleDeleteInterview,
	handleDeleteColdMail,
	copyToClipboard,
}: ModalManagerProps) {
	return (
		<>
			{/* Resumes Management Modal */}
			<AnimatePresence>
				{showResumesModal && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
						onClick={() => setShowResumesModal(false)}
					>
						<motion.div
							initial={{ scale: 0.95, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.95, opacity: 0 }}
							className="backdrop-blur-lg bg-[#222831]/95 border border-white/10 text-[#EEEEEE] max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg relative"
							onClick={(e) => e.stopPropagation()}
						>
							{/* Close Button */}
							<button
								className="absolute right-4 top-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
								onClick={() => setShowResumesModal(false)}
							>
								<X className="h-4 w-4 text-[#EEEEEE]" />
							</button>

							<div className="p-6">
								{/* Header Section */}
								<div className="mb-6">
									<h2 className="text-2xl font-bold text-[#EEEEEE] mb-2 flex items-center">
										<FileText className="mr-3 h-6 w-6 text-[#76ABAE]" />
										Your Resumes ({resumes.length})
									</h2>
									<p className="text-[#EEEEEE]/60">
										Manage your uploaded resumes - rename or delete them as
										needed.
									</p>
								</div>

								{/* Content */}
								<div className="backdrop-blur-lg bg-white/5 rounded-lg p-6 border border-white/10">
									{isLoadingData ? (
										<div className="flex items-center justify-center py-12">
											<Loader
												variant="spinner"
												size="lg"
												className="text-[#76ABAE]"
											/>
										</div>
									) : resumes && resumes.length > 0 ? (
										<div className="space-y-4">
											{resumes.map((resume, index) => (
												<motion.div
													key={resume.id}
													initial={{ opacity: 0, y: 20 }}
													animate={{ opacity: 1, y: 0 }}
													transition={{ duration: 0.3, delay: index * 0.1 }}
													className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
												>
													<div className="flex-1 min-w-0">
														{editingResume?.id === resume.id ? (
															<div className="flex items-center space-x-2">
																<Input
																	value={newResumeName}
																	onChange={(e) =>
																		setNewResumeName(e.target.value)
																	}
																	className="bg-white/10 border-white/20 text-[#EEEEEE] placeholder:text-[#EEEEEE]/40"
																	placeholder="Enter new name"
																/>
																<Button
																	size="sm"
																	onClick={() =>
																		handleRenameResume(resume.id, newResumeName)
																	}
																	className="bg-[#76ABAE] hover:bg-[#76ABAE]/80 text-white"
																>
																	Save
																</Button>
																<Button
																	size="sm"
																	variant="outline"
																	onClick={() => {
																		setEditingResume(null);
																		setNewResumeName("");
																	}}
																	className="border-white/20 text-gray-900 hover:text-[#EEEEEE] hover:bg-white/10"
																>
																	Cancel
																</Button>
															</div>
														) : (
															<div>
																<h3 className="font-semibold text-[#EEEEEE] truncate">
																	{resume.customName}
																</h3>
																<div className="flex items-center space-x-4 mt-1">
																	{resume.candidateName && (
																		<span className="text-xs text-[#EEEEEE]/60">
																			{resume.candidateName}
																		</span>
																	)}
																	{resume.predictedField && (
																		<Badge className="bg-[#76ABAE]/10 text-[#76ABAE] border border-[#76ABAE]/30 text-xs">
																			{resume.predictedField}
																		</Badge>
																	)}
																	<span className="text-xs text-[#EEEEEE]/40">
																		{new Date(
																			resume.uploadDate
																		).toLocaleDateString()}
																	</span>
																</div>
															</div>
														)}
													</div>

													{editingResume?.id !== resume.id && (
														<div className="flex items-center space-x-2 ml-4">
															<Button
																size="sm"
																variant="ghost"
																onClick={() => {
																	setEditingResume({
																		id: resume.id,
																		name: resume.customName,
																	});
																	setNewResumeName(resume.customName);
																}}
																className="text-[#76ABAE] hover:text-[#EEEEEE] hover:bg-white/10"
															>
																<Edit className="h-4 w-4" />
															</Button>
															<Button
																size="sm"
																variant="ghost"
																onClick={() =>
																	setDeletingResume({
																		id: resume.id,
																		name: resume.customName,
																	})
																}
																className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
															>
																<Trash2 className="h-4 w-4" />
															</Button>
														</div>
													)}
												</motion.div>
											))}
										</div>
									) : (
										<div className="text-center py-12">
											<FileText className="h-16 w-16 text-[#76ABAE]/50 mx-auto mb-4" />
											<h3 className="text-lg font-semibold text-[#EEEEEE] mb-2">
												No resumes uploaded yet
											</h3>
											<p className="text-[#EEEEEE]/60 mb-6">
												Upload your first resume to get started with AI-powered
												analysis
											</p>
											<Link href="/dashboard/seeker">
												<Button className="bg-gradient-to-r from-[#76ABAE] to-[#5A8B8F] hover:from-[#5A8B8F] hover:to-[#76ABAE] text-white">
													<FileText className="mr-2 h-4 w-4" />
													Upload Resume
												</Button>
											</Link>
										</div>
									)}
								</div>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Delete Confirmation Dialog */}
			<AnimatePresence>
				{deletingResume && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
						onClick={() => setDeletingResume(null)}
					>
						<motion.div
							initial={{ scale: 0.95, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.95, opacity: 0 }}
							className="backdrop-blur-lg bg-[#222831]/95 border border-white/10 text-[#EEEEEE] max-w-md rounded-lg relative"
							onClick={(e) => e.stopPropagation()}
						>
							{/* Close Button */}
							<button
								className="absolute right-4 top-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
								onClick={() => setDeletingResume(null)}
							>
								<X className="h-4 w-4 text-[#EEEEEE]" />
							</button>

							<div className="p-6">
								{/* Header Section */}
								<div className="mb-6">
									<h2 className="text-2xl font-bold text-[#EEEEEE] mb-2 flex items-center">
										<Trash2 className="mr-3 h-6 w-6 text-red-400" />
										Delete Resume
									</h2>
									<p className="text-[#EEEEEE]/60">
										Are you sure you want to delete "{deletingResume?.name}"?
										This action cannot be undone.
									</p>
								</div>

								{/* Action Buttons */}
								<div className="flex gap-3 justify-end">
									<Button
										variant="outline"
										onClick={() => setDeletingResume(null)}
										className="border-white/20 text-gray-900 hover:text-[#EEEEEE] hover:bg-white/10"
									>
										Cancel
									</Button>
									<Button
										onClick={() => {
											if (deletingResume) {
												handleDeleteResume(deletingResume.id);
												setDeletingResume(null);
											}
										}}
										className="bg-red-600 hover:bg-red-700 text-white"
									>
										Delete
									</Button>
								</div>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Interviews Modal */}
			<AnimatePresence>
				{showInterviewsModal && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
						onClick={() => setShowInterviewsModal(false)}
					>
						<motion.div
							initial={{ scale: 0.95, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.95, opacity: 0 }}
							className="backdrop-blur-lg bg-[#222831]/95 border border-white/10 text-[#EEEEEE] max-w-6xl max-h-[90vh] overflow-y-auto rounded-lg relative"
							onClick={(e) => e.stopPropagation()}
						>
							{/* Close Button */}
							<button
								className="absolute right-4 top-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
								onClick={() => setShowInterviewsModal(false)}
							>
								<X className="h-4 w-4 text-[#EEEEEE]" />
							</button>

							<div className="p-6">
								{/* Header Section */}
								<div className="mb-6">
									<h2 className="text-2xl font-bold text-[#EEEEEE] mb-2 flex items-center">
										<Users className="mr-3 h-6 w-6 text-[#76ABAE]" />
										Interview Sessions ({interviewsData.length})
									</h2>
									<p className="text-[#EEEEEE]/60">
										Your practice interview sessions with questions and answers
									</p>
								</div>

								{/* Content */}
								<div className="backdrop-blur-lg bg-white/5 rounded-lg p-6 border border-white/10">
									{isLoadingInterviews ? (
										<div className="flex items-center justify-center py-8">
											<Loader
												variant="dots"
												size="lg"
												text="Loading interviews..."
											/>
										</div>
									) : interviewsData.length === 0 ? (
										<div className="text-center py-8">
											<Users className="h-16 w-16 mx-auto mb-4 text-[#76ABAE]/50" />
											<h3 className="text-lg font-semibold text-[#EEEEEE] mb-2">
												No interview sessions found
											</h3>
											<p className="text-[#EEEEEE]/60">
												Start practicing to see your sessions here
											</p>
										</div>
									) : (
										<div className="space-y-6">
											{interviewsData.map((session: InterviewSession) => (
												<div
													key={session.id}
													className="backdrop-blur-lg bg-white/5 rounded-lg p-6 border border-white/10"
												>
													{/* Session Header */}
													<div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
														<div className="min-w-0 flex-1">
															<h3 className="text-lg font-semibold text-[#EEEEEE] mb-2 flex items-center">
																<Briefcase className="mr-2 h-5 w-5 text-[#76ABAE]" />
																{session.role} at {session.companyName}
															</h3>
															<p className="text-[#EEEEEE]/60 text-sm">
																{new Date(session.createdAt).toLocaleDateString(
																	"en-US",
																	{
																		year: "numeric",
																		month: "short",
																		day: "numeric",
																		hour: "2-digit",
																		minute: "2-digit",
																	}
																)}
															</p>
														</div>
														<div className="flex items-center gap-2 shrink-0">
															<Badge className="bg-[#76ABAE]/10 text-[#76ABAE] border border-[#76ABAE]/30 text-xs">
																{session.questionsAndAnswers.length} Questions
															</Badge>
															<Button
																size="sm"
																variant="ghost"
																className="h-8 w-8 p-0 hover:bg-red-500/20 text-red-400 hover:text-red-300"
																onClick={() =>
																	setDeletingInterview({
																		id: session.id,
																		role: session.role,
																		companyName: session.companyName,
																	})
																}
															>
																<Trash2 className="h-4 w-4" />
															</Button>
														</div>
													</div>

													{/* Questions and Answers */}
													<div className="space-y-4">
														{session.questionsAndAnswers.map((qa, index) => (
															<div
																key={index}
																className="border-l-2 border-[#76ABAE] pl-4"
															>
																<div className="mb-2">
																	<p className="font-semibold text-[#EEEEEE] mb-1 text-sm sm:text-base">
																		<span className="text-[#76ABAE] font-semibold">
																			Q{index + 1}:
																		</span>{" "}
																		{qa.question}
																	</p>
																</div>
																<div className="backdrop-blur-lg bg-white/5 rounded-lg p-4 border border-white/10 relative">
																	<p className="text-[#EEEEEE]/80 text-sm leading-relaxed pr-10">
																		{qa.answer}
																	</p>
																	<Button
																		size="sm"
																		variant="ghost"
																		className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-white/10"
																		onClick={() => copyToClipboard(qa.answer)}
																	>
																		<Copy className="h-4 w-4 text-[#76ABAE]" />
																	</Button>
																</div>
															</div>
														))}
													</div>
												</div>
											))}
										</div>
									)}
								</div>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Cold Mails Modal */}
			<AnimatePresence>
				{showColdMailsModal && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
						onClick={() => setShowColdMailsModal(false)}
					>
						<motion.div
							initial={{ scale: 0.95, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.95, opacity: 0 }}
							className="backdrop-blur-lg bg-[#222831]/95 border border-white/10 text-[#EEEEEE] max-w-6xl max-h-[90vh] overflow-y-auto rounded-lg relative"
							onClick={(e) => e.stopPropagation()}
						>
							{/* Close Button */}
							<button
								className="absolute right-4 top-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
								onClick={() => setShowColdMailsModal(false)}
							>
								<X className="h-4 w-4 text-[#EEEEEE]" />
							</button>

							<div className="p-6">
								{/* Header Section */}
								<div className="mb-6">
									<h2 className="text-2xl font-bold text-[#EEEEEE] mb-2 flex items-center">
										<Mail className="mr-3 h-6 w-6 text-[#76ABAE]" />
										Cold Emails ({coldMailsData.length})
									</h2>
									<p className="text-[#EEEEEE]/60">
										Your generated cold emails for networking and outreach
									</p>
								</div>

								{/* Content */}
								<div className="backdrop-blur-lg bg-white/5 rounded-lg p-6 border border-white/10">
									{isLoadingColdMails ? (
										<div className="flex items-center justify-center py-8">
											<Loader
												variant="dots"
												size="lg"
												text="Loading cold mails..."
											/>
										</div>
									) : coldMailsData.length === 0 ? (
										<div className="text-center py-8">
											<Mail className="h-16 w-16 mx-auto mb-4 text-[#76ABAE]/50" />
											<h3 className="text-lg font-semibold text-[#EEEEEE] mb-2">
												No cold emails found
											</h3>
											<p className="text-[#EEEEEE]/60">
												Generate your first cold email to see it here
											</p>
										</div>
									) : (
										<div className="space-y-6">
											{coldMailsData.map((session: ColdMailSession) => (
												<div
													key={session.id}
													className="backdrop-blur-lg bg-white/5 rounded-lg p-6 border border-white/10"
												>
													{/* Session Header */}
													<div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
														<div className="min-w-0 flex-1">
															<h3 className="text-lg font-semibold text-[#EEEEEE] mb-1 flex items-center">
																<User className="mr-2 h-5 w-5 text-[#76ABAE]" />
																To: {session.recipientName}
															</h3>
															<p className="text-[#EEEEEE]/80 text-sm mb-1">
																{session.recipientDesignation} at{" "}
																{session.companyName}
															</p>
															<p className="text-[#EEEEEE]/40 text-xs">
																{new Date(session.createdAt).toLocaleDateString(
																	"en-US",
																	{
																		year: "numeric",
																		month: "short",
																		day: "numeric",
																		hour: "2-digit",
																		minute: "2-digit",
																	}
																)}
															</p>
														</div>
														<div className="flex items-center gap-2 shrink-0">
															<Badge className="bg-[#76ABAE]/10 text-[#76ABAE] border border-[#76ABAE]/30 text-xs">
																{session.emails.length} Email
																{session.emails.length !== 1 ? "s" : ""}
															</Badge>
															<Button
																size="sm"
																variant="ghost"
																className="h-8 w-8 p-0 hover:bg-red-500/20 text-red-400 hover:text-red-300"
																onClick={() =>
																	setDeletingColdMail({
																		id: session.id,
																		recipientName: session.recipientName,
																		companyName: session.companyName,
																	})
																}
															>
																<Trash2 className="h-4 w-4" />
															</Button>
														</div>
													</div>

													{/* Emails */}
													<div className="space-y-4">
														{session.emails.map((email, index) => (
															<div
																key={email.id}
																className="border-l-2 border-[#76ABAE] pl-4"
															>
																<div className="mb-2">
																	<p className="font-semibold text-[#EEEEEE] mb-1 flex items-center gap-2 text-sm sm:text-base">
																		<Mail className="h-4 w-4 text-[#76ABAE]" />
																		<span className="text-[#76ABAE] font-semibold">
																			Subject:
																		</span>
																		<span className="truncate">
																			{email.subject}
																		</span>
																	</p>
																</div>
																<div className="backdrop-blur-lg bg-white/5 rounded-lg p-4 border border-white/10 relative">
																	<div className="text-[#EEEEEE]/80 text-sm leading-relaxed pr-10 whitespace-pre-wrap">
																		{email.body}
																	</div>
																	<Button
																		size="sm"
																		variant="ghost"
																		className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-white/10"
																		onClick={() =>
																			copyToClipboard(
																				`Subject: ${email.subject}\n\n${email.body}`
																			)
																		}
																	>
																		<Copy className="h-4 w-4 text-[#76ABAE]" />
																	</Button>
																</div>
															</div>
														))}
													</div>
												</div>
											))}
										</div>
									)}
								</div>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Delete Interview Confirmation Dialog */}
			<AnimatePresence>
				{deletingInterview && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
						onClick={() => setDeletingInterview(null)}
					>
						<motion.div
							initial={{ scale: 0.95, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.95, opacity: 0 }}
							className="backdrop-blur-lg bg-[#222831]/95 border border-white/10 text-[#EEEEEE] max-w-md rounded-lg relative"
							onClick={(e) => e.stopPropagation()}
						>
							{/* Close Button */}
							<button
								className="absolute right-4 top-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
								onClick={() => setDeletingInterview(null)}
							>
								<X className="h-4 w-4 text-[#EEEEEE]" />
							</button>

							<div className="p-6">
								{/* Header Section */}
								<div className="mb-6">
									<h2 className="text-2xl font-bold text-[#EEEEEE] mb-2 flex items-center">
										<Trash2 className="mr-3 h-6 w-6 text-red-400" />
										Delete Interview Session
									</h2>
									<p className="text-[#EEEEEE]/60">
										Are you sure you want to delete the interview session for "
										{deletingInterview?.role} at{" "}
										{deletingInterview?.companyName}"? This action cannot be
										undone and will remove all questions and answers.
									</p>
								</div>

								{/* Action Buttons */}
								<div className="flex gap-3 justify-end">
									<Button
										variant="outline"
										onClick={() => setDeletingInterview(null)}
										className="border-white/20 text-gray-900 hover:text-[#EEEEEE] hover:bg-white/10"
									>
										Cancel
									</Button>
									<Button
										onClick={() => {
											if (deletingInterview) {
												handleDeleteInterview(deletingInterview.id);
												setDeletingInterview(null);
											}
										}}
										className="bg-red-600 hover:bg-red-700 text-white"
									>
										Delete Session
									</Button>
								</div>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Delete Cold Mail Confirmation Dialog */}
			<AnimatePresence>
				{deletingColdMail && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
						onClick={() => setDeletingColdMail(null)}
					>
						<motion.div
							initial={{ scale: 0.95, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.95, opacity: 0 }}
							className="backdrop-blur-lg bg-[#222831]/95 border border-white/10 text-[#EEEEEE] max-w-md rounded-lg relative"
							onClick={(e) => e.stopPropagation()}
						>
							{/* Close Button */}
							<button
								className="absolute right-4 top-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
								onClick={() => setDeletingColdMail(null)}
							>
								<X className="h-4 w-4 text-[#EEEEEE]" />
							</button>

							<div className="p-6">
								{/* Header Section */}
								<div className="mb-6">
									<h2 className="text-2xl font-bold text-[#EEEEEE] mb-2 flex items-center">
										<Trash2 className="mr-3 h-6 w-6 text-red-400" />
										Delete Cold Mail Session
									</h2>
									<p className="text-[#EEEEEE]/60">
										Are you sure you want to delete the cold mail session for "
										{deletingColdMail?.recipientName} at{" "}
										{deletingColdMail?.companyName}"? This action cannot be
										undone and will remove all generated emails.
									</p>
								</div>

								{/* Action Buttons */}
								<div className="flex gap-3 justify-end">
									<Button
										variant="outline"
										onClick={() => setDeletingColdMail(null)}
										className="border-white/20 text-gray-900 hover:text-[#EEEEEE] hover:bg-white/10"
									>
										Cancel
									</Button>
									<Button
										onClick={() => {
											if (deletingColdMail) {
												handleDeleteColdMail(deletingColdMail.id);
												setDeletingColdMail(null);
											}
										}}
										className="bg-red-600 hover:bg-red-700 text-white"
									>
										Delete Session
									</Button>
								</div>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
