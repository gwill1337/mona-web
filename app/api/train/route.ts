import { NextResponse } from "next/server";

const trained = {"status": "ok", "message": "For demo only"}
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST() {
    await delay(1500);
    return NextResponse.json(trained);
}