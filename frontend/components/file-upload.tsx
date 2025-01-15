"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FileUpload() {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const removeFile = (name: string) => {
    setFiles(files => files.filter(file => file.name !== name));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/zip': ['.zip']
    }
  });

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`
          backdrop-blur-lg bg-white/5 border-2 border-dashed rounded-xl p-12
          text-center cursor-pointer transition-colors duration-200
          ${isDragActive ? 'border-[#76ABAE]' : 'border-white/10'}
          hover:border-[#76ABAE]/50
        `}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 mx-auto mb-4 text-[#76ABAE]" />
        <p className="text-[#EEEEEE] text-lg mb-2">
          {isDragActive ? (
            "Drop your files here"
          ) : (
            "Drag & drop your resume here, or click to select"
          )}
        </p>
        <p className="text-[#EEEEEE]/60 text-sm">
          Supports PDF, DOC, DOCX, and ZIP (for bulk upload)
        </p>
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-4"
          >
            {files.map((file) => (
              <div
                key={file.name}
                className="backdrop-blur-lg bg-white/5 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <FileText className="h-6 w-6 text-[#76ABAE]" />
                  <div>
                    <p className="text-[#EEEEEE] font-medium">{file.name}</p>
                    <p className="text-[#EEEEEE]/60 text-sm">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(file.name)}
                  className="text-[#EEEEEE]/60 hover:text-[#EEEEEE]"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button 
              className="w-full bg-[#76ABAE] hover:bg-[#76ABAE]/90 text-white"
              onClick={() => {
                // TODO: Handle file upload to backend
                console.log('Uploading files:', files);
              }}
            >
              Upload and Analyze
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}