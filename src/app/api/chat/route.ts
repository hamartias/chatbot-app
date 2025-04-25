import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';

// Initialize OpenAI client with Deepseek API
const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1', // Deepseek API endpoint
});

export async function POST(request: Request) {
  try {
    const { message, conversationHistory, chatId } = await request.json();

    // Construct the conversation context
    const messages = conversationHistory.map((msg: { role: string; content: string }) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Add the system message and current user message
    messages.unshift({
      role: 'system',
      content: 'You are a helpful AI assistant. Respond to the user in a friendly and informative manner.',
    });
    messages.push({
      role: 'user',
      content: message,
    });

    // Call Deepseek API
    const completion = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0].message.content;

    // Update or create chat in MongoDB
    const client = await clientPromise;
    const db = client.db('chatbot');
    const chats = db.collection('chats');

    const newMessages = [
      ...conversationHistory,
      { role: 'user', content: message },
      { role: 'assistant', content: response }
    ];

    if (chatId) {
      // Update existing chat
      await chats.updateOne(
        { _id: new ObjectId(chatId) },
        {
          $set: {
            messages: newMessages,
            updatedAt: new Date(),
          },
        }
      );
    } else {
      // Create new chat
      const result = await chats.insertOne({
        messages: newMessages,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return NextResponse.json({ 
        response,
        chatId: result.insertedId.toString()
      });
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error processing chat message:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
} 