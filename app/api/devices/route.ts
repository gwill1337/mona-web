import { NextResponse } from 'next/server';
import devicesData from '@/data/devices.json';

export async function GET() {
  return NextResponse.json(devicesData);
}