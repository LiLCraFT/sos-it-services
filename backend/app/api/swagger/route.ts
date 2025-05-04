import { NextResponse } from 'next/server';
import swaggerJson from '../swagger.json';

export function GET() {
  return NextResponse.json(swaggerJson);
} 