import {
	AboutHero,
	Pillars,
	WorkflowStrip,
	TeamFooter,
} from "../../components/about/sections";
import ProblemStats from "../../components/about/problem-stats";
import MarketGrowth from "../../components/about/market-growth";
import WorkflowInteractive from "../../components/about/workflow-interactive";
import TechStackGrid from "../../components/about/tech-stack-grid";
import DualValue from "../../components/about/dual-value";
import CompetitiveEdgeTable from "../../components/about/competitive-edge-table";
import TargetIndustries from "../../components/about/target-industries";
import DatabaseArchitecture from "../../components/about/database-architecture";

export const metadata = {
	title: "About TalentSync | AI-Powered Hiring Intelligence",
	description:
		"Comprehensive overview of TalentSync: market problem, workflow, architecture, features for seekers & employers, competitive edge, and data design.",
};

export default function AboutPage() {
	return (
		<main className="min-h-screen flex flex-col bg-[#1d2228] relative overflow-hidden">
			{/* Ambient background */}
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute inset-0 opacity-[0.12] [background:radial-gradient(circle_at_20%_25%,#76ABAE22,transparent_60%),radial-gradient(circle_at_80%_70%,#76ABAE22,transparent_55%)]" />
				<div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:70px_70px] mix-blend-overlay opacity-20" />
			</div>
			{/* Sections */}
			<AboutHero />
			<ProblemStats />
			<MarketGrowth />
			<WorkflowInteractive />
			<Pillars />
			<TechStackGrid />
			<DualValue />
			<CompetitiveEdgeTable />
			<TargetIndustries />
			<DatabaseArchitecture />
			<WorkflowStrip />
			<TeamFooter />
		</main>
	);
}
