import { NextResponse, NextRequest } from "next/server";
import type { NextApiRequest, NextApiResponse } from "next";
import cassio from "@/cassio";
import { getLLM } from "@/llm";
import { randomUUID } from "crypto";

const Memory = cassio.memorySpace.vs_investment_memory
const KB = cassio.vectorSpace.vs_investment_kb

export const POST = async (req: NextApiRequest) => {
  const body = await req.json();
  const sessionId = body.sessionId || <string>randomUUID();

  const dataForAugmentation =
    await KB.similarity_search(
      body.message,
      2,
      []
    );

  const messages = [];
  messages.push({
    role: "system",
    content: `You are an agent to answer questions about investments.`,
  });
  messages.push({
    role: "assistant",
    content: `Consider the following documents to answer user question: 
    ${dataForAugmentation.map((e) => e["body_blob"]).join("\r\n")}
  `,
  });
  messages.push({ role: "user", content: `${body.message}` });

  const completion = await getLLM().chat.completions.create({
    messages,
    model: "gpt-3.5-turbo",
  });

  const AIAnswer = completion.choices.reduce(
    (acc, cur) => (acc += cur.message.content),
    ""
  );

  Memory.save(
    sessionId,
    body.message,
    AIAnswer
  );

  return NextResponse.json(
    { sessionId, question: body.message, completion },
    { status: 200 }
  );
};
