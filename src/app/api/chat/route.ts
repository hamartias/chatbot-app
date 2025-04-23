import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    // For now, we'll just echo back the message
    // This is where you'll later implement the RAG functionality
    const response = `Echo: ${message}`;

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error processing chat message:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
} 