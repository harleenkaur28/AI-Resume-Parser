"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Star, Briefcase, GraduationCap, Code, Languages } from "lucide-react";
import Link from "next/link";

// Mock data for demonstration
const resumeAnalysis = {
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1 (555) 123-4567",
  experience: "5 years",
  education: "Master's in Computer Science",
  skills: [
    { name: "React", level: 90 },
    { name: "Node.js", level: 85 },
    { name: "TypeScript", level: 80 },
    { name: "Python", level: 75 },
    { name: "AWS", level: 70 },
  ],
  languages: ["English (Native)", "Spanish (Professional)", "French (Basic)"],
  recommendedRoles: [
    "Senior Frontend Developer",
    "Full Stack Engineer",
    "Technical Lead",
  ],
  workHistory: [
    {
      title: "Senior Developer",
      company: "Tech Corp",
      duration: "2020 - Present",
      highlights: [
        "Led team of 5 developers",
        "Improved app performance by 40%",
        "Implemented CI/CD pipeline",
      ],
    },
    {
      title: "Software Engineer",
      company: "StartUp Inc",
      duration: "2018 - 2020",
      highlights: [
        "Developed core features",
        "Reduced bug count by 60%",
        "Mentored junior developers",
      ],
    },
  ],
};

export default function AnalysisPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831]">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/dashboard/recruiter">
            <Button variant="ghost" className="text-[#EEEEEE] hover:text-[#76ABAE]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-12"
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-[#EEEEEE]">Resume Analysis</h1>
            <Button className="bg-[#76ABAE] hover:bg-[#76ABAE]/90">
              <Download className="mr-2 h-4 w-4" />
              Download Resume
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card className="backdrop-blur-lg bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-[#EEEEEE] flex items-center">
                    <Star className="mr-2 h-5 w-5 text-[#76ABAE]" />
                    Skills Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {resumeAnalysis.skills.map((skill) => (
                    <div key={skill.name}>
                      <div className="flex justify-between mb-1">
                        <span className="text-[#EEEEEE]">{skill.name}</span>
                        <span className="text-[#76ABAE]">{skill.level}%</span>
                      </div>
                      <Progress value={skill.level} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="backdrop-blur-lg bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-[#EEEEEE] flex items-center">
                    <Briefcase className="mr-2 h-5 w-5 text-[#76ABAE]" />
                    Work Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {resumeAnalysis.workHistory.map((work, index) => (
                    <div key={index} className="border-l-2 border-[#76ABAE] pl-4">
                      <h3 className="text-[#EEEEEE] font-semibold">{work.title}</h3>
                      <p className="text-[#76ABAE] text-sm">{work.company} | {work.duration}</p>
                      <ul className="mt-2 space-y-1">
                        {work.highlights.map((highlight, i) => (
                          <li key={i} className="text-[#EEEEEE]/60 text-sm">• {highlight}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
              <Card className="backdrop-blur-lg bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-[#EEEEEE] flex items-center">
                    <Code className="mr-2 h-5 w-5 text-[#76ABAE]" />
                    Recommended Roles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {resumeAnalysis.recommendedRoles.map((role, index) => (
                      <Badge
                        key={index}
                        className="mr-2 bg-[#76ABAE]/20 text-[#76ABAE] hover:bg-[#76ABAE]/30"
                      >
                        {role}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-lg bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-[#EEEEEE] flex items-center">
                    <Languages className="mr-2 h-5 w-5 text-[#76ABAE]" />
                    Languages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {resumeAnalysis.languages.map((language, index) => (
                      <div key={index} className="text-[#EEEEEE]/80">
                        {language}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-lg bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-[#EEEEEE] flex items-center">
                    <GraduationCap className="mr-2 h-5 w-5 text-[#76ABAE]" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#EEEEEE]/80">{resumeAnalysis.education}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}