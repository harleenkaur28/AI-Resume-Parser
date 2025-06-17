import React from "react";

export default function InterviewPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
			<div className="max-w-4xl mx-auto">
				<div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8">
					<div className="text-center">
						<div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full mb-6">
							<svg
								className="w-8 h-8 text-white"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
								/>
							</svg>
						</div>
						<h1 className="text-3xl font-bold text-white mb-4">
							Interview Preparation
						</h1>
						<p className="text-slate-300 text-lg mb-8">
							Prepare for your next interview with AI-powered practice sessions
							and personalized feedback.
						</p>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
							<div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/30">
								<h3 className="text-xl font-semibold text-white mb-3">
									Mock Interviews
								</h3>
								<p className="text-slate-300 mb-4">
									Practice with AI-generated interview questions tailored to
									your field.
								</p>
								<button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors">
									Start Practice
								</button>
							</div>

							<div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/30">
								<h3 className="text-xl font-semibold text-white mb-3">
									Question Bank
								</h3>
								<p className="text-slate-300 mb-4">
									Access hundreds of common interview questions across different
									roles.
								</p>
								<button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors">
									Browse Questions
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
