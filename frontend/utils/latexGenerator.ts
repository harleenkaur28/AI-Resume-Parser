// utils/latexGenerator.ts
import { ResumeData, PdfGenerationRequest } from '@/types/resume';
import { escapeLatex, sanitizeForHeader, formatLatexList } from './latexEscape';

export interface LatexTemplate {
  id: string;
  name: string;
  generate: (data: ResumeData, options?: any) => string;
}

/**
 * Professional Resume Template - Clean and ATS-friendly
 */
export const professionalTemplate: LatexTemplate = {
  id: 'professional',
  name: 'Professional',
  generate: (data: ResumeData, options = {}) => {
    const {
      fontSize = 10,
      margins = { top: 0.75, bottom: 0.75, left: 0.75, right: 0.75 },
      colorScheme = 'default'
    } = options;

    return `\\documentclass[letterpaper,${fontSize}pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{enumitem}
\\usepackage[left=${margins.left}in,right=${margins.right}in,top=${margins.top}in,bottom=${margins.bottom}in]{geometry}
\\usepackage{ragged2e}
\\usepackage{amsmath}
\\usepackage{multicol}
\\usepackage{titlesec}
\\usepackage{xcolor}
\\usepackage{hyperref}

% Define colors based on scheme
${getColorDefinitions(colorScheme)}

% Custom commands for spacing and headings
\\newcommand{\\sectionheader}[1]{%
  \\vspace{0.15in}%
  \\textbf{\\Large \\textcolor{primary}{#1}}%
  \\vspace{0.05in}%
  \\hrule height 0.5pt%
  \\vspace{0.1in}%
}

\\newcommand{\\subsectionheader}[1]{%
  \\vspace{0.08in}%
  \\textbf{\\large #1}%
  \\vspace{0.04in}%
}

\\pagestyle{empty}
\\begin{document}

% Header with name and contact
\\begin{center}
  \\textbf{\\Huge \\textcolor{primary}{${sanitizeForHeader(data.name)}}}
  \\vspace{0.1in}
  
  \\textcolor{secondary}{${escapeLatex(data.email)} $\\bullet$ ${escapeLatex(data.contact)}}
  ${data.predicted_field ? `\\\\\\textit{${escapeLatex(data.predicted_field)}}` : ''}
\\end{center}

\\vspace{0.2in}

${generateEducationSection(data.education)}

${generateSkillsSection(data.skills_analysis, data.languages)}

${generateExperienceSection(data.work_experience)}

${generateProjectsSection(data.projects)}

${data.recommended_roles.length > 0 ? generateRecommendedRolesSection(data.recommended_roles) : ''}

\\end{document}`;
  }
};

/**
 * Modern Resume Template - More visual with better spacing
 */
export const modernTemplate: LatexTemplate = {
  id: 'modern',
  name: 'Modern',
  generate: (data: ResumeData, options = {}) => {
    return `\\documentclass[letterpaper,11pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{enumitem}
\\usepackage[left=0.6in,right=0.6in,top=0.6in,bottom=0.6in]{geometry}
\\usepackage{ragged2e}
\\usepackage{xcolor}
\\usepackage{fontawesome5}
\\usepackage{hyperref}
\\usepackage{titlesec}

% Define modern colors
\\definecolor{primary}{RGB}{41, 128, 185}
\\definecolor{secondary}{RGB}{52, 73, 94}
\\definecolor{accent}{RGB}{230, 126, 34}

% Custom section formatting
\\titleformat{\\section}{\\large\\bfseries\\color{primary}}{}{0em}{}[\\titlerule]
\\titlespacing*{\\section}{0pt}{0.3in}{0.1in}

\\pagestyle{empty}
\\begin{document}

% Modern header with icons
\\begin{center}
  \\textbf{\\huge \\color{primary}${sanitizeForHeader(data.name)}}
  \\vspace{0.1in}
  
  \\color{secondary}
  \\faEnvelope\\space ${escapeLatex(data.email)} \\quad
  \\faPhone\\space ${escapeLatex(data.contact)}
\\end{center}

\\vspace{0.2in}

${generateEducationSection(data.education, true)}

${generateSkillsSection(data.skills_analysis, data.languages, true)}

${generateExperienceSection(data.work_experience, true)}

${generateProjectsSection(data.projects, true)}

\\end{document}`;
  }
};

function getColorDefinitions(colorScheme: string): string {
  switch (colorScheme) {
    case 'blue':
      return `\\definecolor{primary}{RGB}{41, 128, 185}
\\definecolor{secondary}{RGB}{52, 73, 94}
\\definecolor{accent}{RGB}{46, 134, 193}`;
    case 'green':
      return `\\definecolor{primary}{RGB}{39, 174, 96}
\\definecolor{secondary}{RGB}{52, 73, 94}
\\definecolor{accent}{RGB}{46, 204, 113}`;
    case 'red':
      return `\\definecolor{primary}{RGB}{231, 76, 60}
\\definecolor{secondary}{RGB}{52, 73, 94}
\\definecolor{accent}{RGB}{192, 57, 43}`;
    default:
      return `\\definecolor{primary}{RGB}{52, 73, 94}
\\definecolor{secondary}{RGB}{127, 140, 141}
\\definecolor{accent}{RGB}{41, 128, 185}`;
  }
}

function generateEducationSection(education: any[], modern = false): string {
  if (!education || education.length === 0) return '';

  const sectionTitle = modern ? '\\section{Education}' : '\\sectionheader{Education}';
  
  return `${sectionTitle}
\\begin{itemize}[leftmargin=*,noitemsep,topsep=0pt,parsep=0pt]
${education.map(edu => `\\item ${escapeLatex(edu.education_detail)}`).join('\n')}
\\end{itemize}

`;
}

function generateSkillsSection(skills: any[], languages: any[], modern = false): string {
  if ((!skills || skills.length === 0) && (!languages || languages.length === 0)) return '';

  const sectionTitle = modern ? '\\section{Skills}' : '\\sectionheader{Skills}';
  
  // Group skills by type (this is a simplified categorization)
  const programmingSkills = skills.filter(s => 
    ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'Next.js', 'FastAPI', 'Django', 'Flask'].some(tech => 
      s.skill_name.toLowerCase().includes(tech.toLowerCase())
    )
  );
  
  const toolsSkills = skills.filter(s => 
    ['Docker', 'AWS', 'Git', 'MongoDB', 'PostgreSQL', 'Redis', 'Kubernetes'].some(tool => 
      s.skill_name.toLowerCase().includes(tool.toLowerCase())
    )
  );

  const otherSkills = skills.filter(s => 
    !programmingSkills.includes(s) && !toolsSkills.includes(s)
  );

  return `${sectionTitle}
\\begin{itemize}[leftmargin=*,noitemsep,topsep=0pt,parsep=0pt]
${programmingSkills.length > 0 ? `\\item \\textbf{Programming \\& Frameworks:} ${formatLatexList(programmingSkills.map(s => s.skill_name))}` : ''}
${toolsSkills.length > 0 ? `\\item \\textbf{Tools \\& Technologies:} ${formatLatexList(toolsSkills.map(s => s.skill_name))}` : ''}
${otherSkills.length > 0 ? `\\item \\textbf{Other Skills:} ${formatLatexList(otherSkills.map(s => s.skill_name))}` : ''}
${languages && languages.length > 0 ? `\\item \\textbf{Languages:} ${formatLatexList(languages.map(l => l.language))}` : ''}
\\end{itemize}

`;
}

function generateExperienceSection(experience: any[], modern = false): string {
  if (!experience || experience.length === 0) return '';

  const sectionTitle = modern ? '\\section{Experience}' : '\\sectionheader{Experience \\& Positions of Responsibility}';
  
  return `${sectionTitle}
\\begin{itemize}[leftmargin=*,noitemsep,topsep=0pt,parsep=0pt]
${experience.map(exp => {
  let result = `\\item \\textbf{${escapeLatex(exp.role)}} - ${escapeLatex(exp.company_and_duration)}`;
  if (exp.bullet_points && exp.bullet_points.length > 0) {
    result += `\n  \\begin{itemize}[leftmargin=0.2in,noitemsep,topsep=0pt,parsep=0pt]`;
    result += exp.bullet_points.map((bullet: string) => `\n  \\item ${escapeLatex(bullet)}`).join('');
    result += `\n  \\end{itemize}`;
  }
  return result;
}).join('\n')}
\\end{itemize}

`;
}

function generateProjectsSection(projects: any[], modern = false): string {
  if (!projects || projects.length === 0) return '';

  const sectionTitle = modern ? '\\section{Notable Projects}' : '\\sectionheader{Notable Projects}';
  
  return `${sectionTitle}
\\begin{itemize}[leftmargin=*,noitemsep,topsep=0pt,parsep=0pt]
${projects.map(project => `\\item \\textbf{${escapeLatex(project.title)}}
\\justifying \\textit{Technologies: ${formatLatexList(project.technologies_used)}}
\\justifying ${escapeLatex(project.description)}`).join('\n')}
\\end{itemize}

`;
}

function generateRecommendedRolesSection(roles: string[]): string {
  if (!roles || roles.length === 0) return '';
  
  return `\\sectionheader{Recommended Career Paths}
\\begin{itemize}[leftmargin=*,noitemsep,topsep=0pt,parsep=0pt]
\\item ${formatLatexList(roles)}
\\end{itemize}

`;
}

// Export available templates
export const availableTemplates: LatexTemplate[] = [
  professionalTemplate,
  modernTemplate
];

/**
 * Generate LaTeX document from resume data
 */
export function generateLatexDocument(request: PdfGenerationRequest): string {
  const template = availableTemplates.find(t => t.id === request.template) || professionalTemplate;
  return template.generate(request.resumeData, request.options);
}
