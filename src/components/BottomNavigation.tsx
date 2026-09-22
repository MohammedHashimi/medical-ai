"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  {
    label: "Home",
    href: "/patient",
    icon: "⌂",
  },
  {
    label: "History",
    href: "/patient/history",
    icon: "▤",
  },
  {
    label: "AI",
    href: "/patient/ai",
    icon: "✦",
  },
  {
    label: "Profile",
    href: "/patient/profile",
    icon: "○",
  },
];

export default function PatientBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-5xl grid-cols-4 px-4 py-3">

        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/patient" &&
              pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center text-xs transition-colors ${
                isActive
                  ? "font-medium text-slate-900"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <span className="text-lg">
                {item.icon}
              </span>

              <span>
                {item.label}
              </span>
            </Link>
          );
        })}

      </div>
    </nav>
  );
}