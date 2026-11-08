import { generateMockDataset } from "@/utils/demo/generateMetrics";
import { NextResponse } from "next/server";
import devicesData from "@/data/devices.json";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const HISTORY = 30 * DAY;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const seed = searchParams.get("seed");
  const anchorMs = Number(searchParams.get("anchor"));

  const hoursParam = searchParams.get("hours");
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const device = searchParams.get("device");

  const maxPointsParam = searchParams.get("max_points");
  const requestedMax = maxPointsParam ? Number(maxPointsParam) : 2000;

  const maxPoints =
    Number.isFinite(requestedMax) && requestedMax > 0
      ? Math.min(Math.floor(requestedMax), 10000)
      : 2000;

  if (!seed || seed.length > 100 || !Number.isFinite(anchorMs) || anchorMs <= 0) {
    return NextResponse.json(
      { error: "Invalid demo parameters" },
      { status: 400 },
    );
  }

  const historyStart = anchorMs - HISTORY;

  let since: number;
  let until = anchorMs;

  if (start && end) {
    const parsedStart = new Date(start).getTime();
    const parsedEnd = new Date(end).getTime();

    if (
      !Number.isFinite(parsedStart) ||
      !Number.isFinite(parsedEnd) ||
      parsedEnd < parsedStart
    ) {
      return NextResponse.json(
        { error: "Invalid date range" },
        { status: 400 },
      );
    }

    since = Math.max(parsedStart, historyStart);
    until = Math.min(parsedEnd, anchorMs);
  } else {
    const parsedHours = hoursParam === null ? 1 : Number(hoursParam);

    const rangeHours =
      Number.isFinite(parsedHours) && parsedHours >= 0
        ? parsedHours === 0
          ? 720
          : Math.min(parsedHours, 720)
        : 1;

    since = Math.max(anchorMs - rangeHours * HOUR, historyStart);
  }

  if (since > until) {
    return NextResponse.json(
      { error: "Date range is outside demo history" },
      { status: 400 },
    );
  }

  const deltaHours = (until - since) / HOUR;

  const bucketSeconds =
    deltaHours >= 168 ? 3600 : deltaHours > 12 ? 600 : 60;

  const sampleIntervalSeconds = deltaHours >= 168 ? 300 : 60;

  const generated = generateMockDataset(
    seed,
    since,
    until,
    sampleIntervalSeconds,
    anchorMs,
  );

  const filtered = generated.metrics.filter((m) => {
    const timestamp = new Date(m.timestamp).getTime();

    return (
      (!device || m.device === device) &&
      timestamp >= since &&
      timestamp <= until
    );
  });

  const bucketMap = new Map<
    string,
    {
      device: string;
      bucketTs: number;
      cpuSum: number;
      ramSum: number;
      count: number;
    }
  >();

  for (const metric of filtered) {
    const timestamp = new Date(metric.timestamp).getTime();

    const bucketTs =
      Math.floor(timestamp / (bucketSeconds * 1000)) *
      bucketSeconds *
      1000;

    const key = `${metric.device}_${bucketTs}`;

    let bucket = bucketMap.get(key);

    if (!bucket) {
      bucket = {
        device: metric.device,
        bucketTs,
        cpuSum: 0,
        ramSum: 0,
        count: 0,
      };

      bucketMap.set(key, bucket);
    }

    bucket.cpuSum += metric.cpu;
    bucket.ramSum += metric.ram;
    bucket.count += 1;
  }

  const bucketedMetrics = Array.from(bucketMap.values()).map((b) => ({
    device: b.device,
    timestamp: new Date(b.bucketTs).toISOString(),
    cpu: Number((b.cpuSum / b.count).toFixed(1)),
    ram: Number((b.ramSum / b.count).toFixed(1)),
  }));

  const metricsByDevice = new Map<
    string,
    typeof bucketedMetrics
  >();

  for (const metric of bucketedMetrics) {
    const list = metricsByDevice.get(metric.device) ?? [];
    list.push(metric);
    metricsByDevice.set(metric.device, list);
  }

  const metrics = Array.from(metricsByDevice.values())
    .flatMap((points) => points.slice(-maxPoints))
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() -
        new Date(b.timestamp).getTime(),
    )
    .map((metric, id) => ({
      id,
      ...metric,
    }));

  const anomalies = generated.anomalies.filter((a) => {
    const timestamp = new Date(a.timestamp).getTime();

    return (
      (!device || a.device === device) &&
      timestamp >= since &&
      timestamp <= until
    );
  });

  return NextResponse.json(
    {
      devices: devicesData,
      model: null,
      metrics,
      anomalies,
    },
    {
      headers: {
        "Cache-Control": "private, no-store",
      },
    },
  );
}