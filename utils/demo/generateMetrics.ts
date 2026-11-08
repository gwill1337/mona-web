const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

interface DeviceProfile {
  name: string;
  cpuBase: number;
  cpuAmplitude: number;
  ramBase: number;
  ramAmplitude: number;
  phase: number;
}

export interface MockMetric {
  device: string;
  timestamp: string;
  cpu: number;
  ram: number;
}

export interface MockAnomaly {
  id: number;
  device: string;
  timestamp: string;
  cpu: number;
  ram: number;
  score: number;
  reason: string;
}

const DEVICES: DeviceProfile[] = [
  {
    name: "mona-pc-01",
    cpuBase: 12,
    cpuAmplitude: 23,
    ramBase: 44,
    ramAmplitude: 5,
    phase: 0.5,
  },
  {
    name: "mona-srv-02",
    cpuBase: 17,
    cpuAmplitude: 23,
    ramBase: 56,
    ramAmplitude: 5,
    phase: 2.1,
  },
  {
    name: "srv-1-prod",
    cpuBase: 20,
    cpuAmplitude: 25,
    ramBase: 63,
    ramAmplitude: 5,
    phase: 4.2,
  },
];

function hash(value: string): number {
  let result = 2166136261;

  for (let i = 0; i < value.length; i++) {
    result ^= value.charCodeAt(i);
    result = Math.imul(result, 16777619);
  }

  return result >>> 0;
}

function random(seed: string): number {
  return hash(seed) / 4294967295;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function generateMockDataset(
  seed: string,
  startMs: number,
  endMs: number,
  sampleIntervalSeconds: number,
  anchorMs: number,
) {
  const events = [
    {
      id: 1,
      device: "srv-1-prod",
      peakTs: anchorMs - 40 * MINUTE,
    },
    {
      id: 2,
      device: "mona-srv-02",
      peakTs: anchorMs - 15 * MINUTE,
    },
  ];

  const step = sampleIntervalSeconds * 1000;
  const firstTimestamp = Math.ceil(startMs / step) * step;

  const metrics: MockMetric[] = [];

  for (const device of DEVICES) {
    for (
      let timestamp = firstTimestamp;
      timestamp <= endMs;
      timestamp += step
    ) {
      const date = new Date(timestamp);
      const hour = date.getUTCHours() + date.getUTCMinutes() / 60;

      const dailyLoad =
        (Math.sin(((hour - 8) / 24) * Math.PI * 2 + device.phase) + 1) / 2;

      const cpuNoise =
        (random(`${seed}:${device.name}:${timestamp}:cpu`) - 0.5) * 5;

      const ramNoise =
        (random(`${seed}:${device.name}:${timestamp}:ram`) - 0.5) * 3;

      let cpu =
        device.cpuBase +
        device.cpuAmplitude * dailyLoad +
        cpuNoise +
        Math.sin(timestamp / (5 * HOUR) + device.phase) * 2;

      let ram =
        device.ramBase +
        device.ramAmplitude * dailyLoad +
        ramNoise;

      for (const event of events) {
        if (event.device !== device.name) continue;

        const distance = Math.abs(timestamp - event.peakTs);
        const shape = Math.max(0, 1 - distance / (10 * MINUTE));

        cpu += (92 - cpu) * shape;
        ram += (90 - ram) * shape;
      }

      metrics.push({
        device: device.name,
        timestamp: new Date(timestamp).toISOString(),
        cpu: Number(clamp(cpu, 2, 98).toFixed(1)),
        ram: Number(clamp(ram, 10, 97).toFixed(1)),
      });
    }
  }

  const metricMap = new Map(
    metrics.map((m) => [
      `${m.device}:${new Date(m.timestamp).getTime()}`,
      m,
    ]),
  );

  const anomalies: MockAnomaly[] = events.flatMap((event) => {
    const point = metricMap.get(`${event.device}:${event.peakTs}`);

    if (!point) return [];

    return [
      {
        id: event.id,
        device: event.device,
        timestamp: new Date(event.peakTs).toISOString(),
        cpu: point.cpu,
        ram: point.ram,
        score: event.id === 1 ? -0.15 : -0.12,
        reason: `high resource usage (CPU ${point.cpu}%, RAM ${point.ram}%)`,
      },
    ];
  });

  return { metrics, anomalies };
}