import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

interface RoleCardProps {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export default function RoleCard({
  href,
  title,
  description,
  icon: Icon,
}: RoleCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
        <Icon className="h-6 w-6" />
      </span>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        <p className="text-sm leading-relaxed text-slate-500">{description}</p>
      </div>
      <span className="mt-auto flex items-center gap-1 text-sm font-medium text-indigo-600">
        Get started
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
