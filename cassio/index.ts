import { Client, ClientOptions } from "cassandra-driver";

let cassandra: Client | null = null;

export function session(): Client {
  if (!cassandra) {
    cassandra = new Client({
      cloud: {
        secureConnectBundle: process.env.ASTRA_DB_SECURE_BUNDLE_PATH!,
      },
      credentials: {
        username: process.env.ASTRA_DB_CLIENT_ID!,
        password: process.env.ASTRA_DB_CLIENT_SECRET!,
      },
    });
    cassandra
      .connect()
      .then(() => {
        console.log("Connected to Cassandra");
      })
      .catch((err) => {
        console.error("Error connecting to Cassandra:", err);
      });
    return cassandra;
  } else {
    return cassandra;
  }
}

interface MetadataFilter {
  key: string;
  value: string;
}

export async function similarity_search(
  table: String,
  vectorField: String,
  embedding: Array<number>,
  limit: number,
  metadata?: Array<MetadataFilter>
) {
  const embeddingf = new Float32Array(embedding);

  const query = `SELECT body_blob
  FROM demo.${table}
  ${
    metadata &&
    metadata.length > 0 &&
    `WHERE ${metadata.map((e) => `metadata_s['${e.key}'] = '${e.value}'`)} `
  }
 ORDER BY ${vectorField} ANN OF ? 
 LIMIT ${limit}`;

  const result = await session().execute(
    query,
    [embeddingf]
  );
  return result.rows;
}

export default cassandra;
