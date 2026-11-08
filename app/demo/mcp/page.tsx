"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Callout, CodeBlock } from "@/components/docs/ui";
import { McpDocs } from "@/components/demo/McpDocs";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

function generateKey(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `mona_api_${hex}`;
}

export default function Page() {
  const [keyName, setKeyName] = useState("Claude Desktop Key");
  const [apiKey, setApiKey] = useState<string | null>(null);

  return (
    <div className="relative flex min-h-screen flex-col bg-black font-sans text-white md:flex-row">
      <main className="w-full min-w-0 flex-1 px-6 py-10">
        <div className="mx-auto mt-5 max-w-3xl">
          <header className="mb-10 mt-2 w-full">
            <h1 className="text-3xl font-bold tracking-tight text-neutral-50">
              MCP API keys
            </h1>
            <p className="mt-1 text-sm text-neutral-400">
              Generate and manage secure authentication keys for Claude and MCP
              integrations
            </p>
          </header>

          <div className="rounded-xl border border-white/10 bg-neutral-900/30 p-5 sm:p-6">
            <label
              htmlFor="mcp-key-name"
              className="mb-2 block text-sm font-medium text-neutral-300"
            >
              Key name
            </label>
            <input
              id="mcp-key-name"
              type="text"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              placeholder="e.g. Claude Desktop"
              className={`h-11 w-full rounded-xl border border-white/10 bg-neutral-900/60 px-4 text-sm text-neutral-100 placeholder:text-neutral-500 transition-colors outline-none focus:border-neutral-500`}
            />
            <p className="mt-2 text-xs text-neutral-400">
              Provide a descriptive name to identify this key’s purpose in the
              system
            </p>

            <button
              type="button"
              onClick={() => setApiKey(generateKey())}
              disabled={!keyName.trim()}
              className={`mt-6 flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-neutral-950 transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto ${focusRing}`}
            >
              <Plus size={16} strokeWidth={1.5} aria-hidden="true" />
              Generate API key
            </button>

            {apiKey && (
              <div className="mt-6 flex flex-col gap-4">
                <Callout kind="warn" title="Demo API key">
                  This is a demonstration key generated in your browser. It won't work with a real MONA server.
                </Callout>
                <CodeBlock lang="api key" title="API key" code={apiKey} />
              </div>
            )}
          </div>

          <McpDocs apiKey={apiKey} />
        </div>
      </main>
    </div>
  );
}