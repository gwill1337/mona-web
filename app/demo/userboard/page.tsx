"use client";
import { Plus } from "lucide-react";
import { useState } from "react";
import { DemoModal } from "@/components/demo/modal/DemoModal";
import { User } from "@/types/demo/DemoTypes";
import { UserCard } from "@/components/demo/UserCard";

const USERS: User[] = [
  { id: 1, username: "admin", role: "admin" },
  { id: 2, username: "user1", role: "user" },
  { id: 3, username: "user2", role: "user" },
  { id: 4, username: "user3", role: "user" },
];

export default function UserBoard() {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col md:flex-row relative">
      <main className="flex-1 px-6 py-10 w-full">
        <div className="relative max-w-5xl mx-auto px-6 mt-5">
          <header className="flex items-start justify-between mb-9 gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">
                  Users Registry
                </h1>
                <p className="text-slate-400 text-sm mt-1">Manage Users</p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-1">
              <button
                onClick={() => setDemoOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-gray-200 text-slate-950 font-semibold text-sm transition-colors cursor-pointer"
              >
                <Plus size={18} />
                Add user
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {USERS.map((u, i) => (
              <UserCard
                key={u.username}
                user={u}
                index={i}
                onClick={() => setDemoOpen(true)}
              />
            ))}
          </div>
        </div>
      </main>

      {DemoModal && (
        <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
      )}
    </div>
  );
}