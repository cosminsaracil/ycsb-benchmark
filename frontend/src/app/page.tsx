"use client";

import Link from "next/link";
import { ROUTES } from "@/utils/routes";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-3xl font-bold">Hello!</h1>
      <Link
        href={ROUTES.YCSB}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Go to YCSB Dashboard
      </Link>
    </div>
  );
}
