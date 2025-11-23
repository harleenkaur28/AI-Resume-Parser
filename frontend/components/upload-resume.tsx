import React, { useState } from "react";

interface UploadResumeProps {
	onSuccess?: (result: any) => void;
	onError?: (error: string) => void;
}

export default function UploadResume({
	onSuccess,
	onError,
}: UploadResumeProps) {
	const [file, setFile] = useState<File | null>(null);
	const [customName, setCustomName] = useState("");
	const [showInCentral, setShowInCentral] = useState(false);
	const [isUploading, setIsUploading] = useState(false);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0];
		if (selectedFile) {
			setFile(selectedFile);
			// Set default custom name to file name without extension
			const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
			setCustomName(nameWithoutExt);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!file || !customName.trim()) {
			onError?.("Please select a file and provide a custom name");
			return;
		}

		setIsUploading(true);

		try {
			const formData = new FormData();
			formData.append("file", file);
			formData.append("customName", customName.trim());
			formData.append("showInCentral", showInCentral.toString());

			const response = await fetch("/api/analysis", {
				method: "POST",
				body: formData,
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || "Upload failed");
			}

			onSuccess?.(result);

			// Reset form
			setFile(null);
			setCustomName("");
			setShowInCentral(false);

			// Reset file input
			const fileInput = document.getElementById(
				"resume-file"
			) as HTMLInputElement;
			if (fileInput) {
				fileInput.value = "";
			}
		} catch (error) {
			console.error("Upload error:", error);
			onError?.(error instanceof Error ? error.message : "Upload failed");
		} finally {
			setIsUploading(false);
		}
	};

	return (
		<div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
			<h2 className="text-2xl font-bold mb-6 text-center">Upload Resume</h2>

			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label
						htmlFor="resume-file"
						className="block text-sm font-medium text-gray-700 mb-2"
					>
						Select Resume File
					</label>
					<input
						id="resume-file"
						type="file"
						accept=".pdf,.doc,.docx,.txt,.md"
						onChange={handleFileChange}
						className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
						disabled={isUploading}
					/>
					<p className="mt-1 text-xs text-gray-500">
						Supported formats: PDF, DOC, DOCX, TXT, MD
					</p>
				</div>

				<div>
					<label
						htmlFor="custom-name"
						className="block text-sm font-medium text-gray-700 mb-2"
					>
						Custom Name
					</label>
					<input
						id="custom-name"
						type="text"
						value={customName}
						onChange={(e) => setCustomName(e.target.value)}
						placeholder="Enter a name for this resume"
						className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
						disabled={isUploading}
						required
					/>
				</div>

				<div className="flex items-center">
					<input
						id="show-in-central"
						type="checkbox"
						checked={showInCentral}
						onChange={(e) => setShowInCentral(e.target.checked)}
						className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
						disabled={isUploading}
					/>
					<label
						htmlFor="show-in-central"
						className="ml-2 block text-sm text-gray-700"
					>
						Show in central repository
					</label>
				</div>

				<button
					type="submit"
					disabled={isUploading || !file || !customName.trim()}
					className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isUploading ? (
						<>
							<svg
								className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								></circle>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							Analyzing...
						</>
					) : (
						"Upload & Analyze"
					)}
				</button>
			</form>

			{file && (
				<div className="mt-4 p-3 bg-gray-50 rounded-md">
					<p className="text-sm text-gray-600">
						<strong>Selected file:</strong> {file.name}
					</p>
					<p className="text-sm text-gray-600">
						<strong>Size:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB
					</p>
				</div>
			)}
		</div>
	);
}
