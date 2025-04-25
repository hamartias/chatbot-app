import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();
    const client = await clientPromise;
    const db = client.db('chatbot');
    const chats = db.collection('chats');

    const result = await chats.insertOne({
      messages,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ chatId: result.insertedId.toString() });
  } catch (error) {
    console.error('Error creating chat:', error);
    return NextResponse.json(
      { error: 'Failed to create chat' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('chatbot');
    const chats = db.collection('chats');

    const chat = await chats.findOne({
      _id: new ObjectId(chatId),
    });

    if (!chat) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(chat);
  } catch (error) {
    console.error('Error fetching chat:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat' },
      { status: 500 }
    );
  }
} 