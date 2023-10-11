import { NextResponse, NextRequest } from "next/server";
import type { NextApiRequest, NextApiResponse } from "next";
import { session, similarity_search } from "@/cassio";
import { getLLM } from "@/llm";

export const POST = async (req: NextApiRequest) => {
  const body = await req.json();
  console.log(body);

  const resEmbedding = await getLLM().embeddings.create({
    input: body.message,
    model: "text-embedding-ada-002",
  });

  const embedding = new Float32Array(resEmbedding.data[0].embedding);
  // return NextResponse.json(embedding, { status: 200 });

  const result = await similarity_search(
    "vs_investment",
    "vector",
    resEmbedding.data[0].embedding,
    5,
    [{ key: "source", value: "funds/ALASKAI0623.pdf" }]
  );

  // const result = await session().execute(
  //   `SELECT body_blob
  //     FROM demo.vs_investment
  //     WHERE metadata_s['source'] = 'funds/ALASKAI0623.pdf'
  //    ORDER BY vector ANN OF ?
  //    LIMIT 3`,
  //   [embedding]
  // );
  // console.log(result.rows);

  // return NextResponse.json(result.rows, { status: 200 });

  const messages = [];
  messages.push({
    role: "system",
    content: `You are an agent to answer questions about investments. `,
  });
  messages.push({
    role: "assistant",
    content: `Consider the following documents to answer user question: 
    ${result.map((e) => e["body_blob"]).join("\r\n")}
  `,
  });
  messages.push({ role: "user", content: `${body.message}` });

  const completion = await getLLM().chat.completions.create({
    messages,
    model: "gpt-3.5-turbo",
  });

  return NextResponse.json({question: body.message, completion}, { status: 200 });
};
