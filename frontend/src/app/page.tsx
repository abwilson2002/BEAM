import { Briefcase, Search } from "lucide-react";
import BackendStatus from "@/components/BackendStatus";
import RoleCard from "@/components/RoleCard";

export default function LandingPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-6 py-16">
      <div className="mb-12 text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-indigo-600">
          BEAM
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
          What brings you here today?
        </h1>
        <p className="mt-4 text-lg text-slate-500">
          Choose how you want to use BEAM.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <RoleCard
          href="/hiring"
          icon={Briefcase}
          title="I am Hiring"
          description="Find and connect with candidates who fit the roles on your team."
        />
        <RoleCard
          href="/looking/setup"
          icon={Search}
          title="I am Looking"
          description="Build a prioritized list of target companies and focus your job search."
        />
      </div>

      <div className="mt-12">
        <BackendStatus />
      </div>
    </main>
  );
}
