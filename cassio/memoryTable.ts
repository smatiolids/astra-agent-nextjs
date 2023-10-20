import { UUID, randomUUID } from "crypto";
import { Cassio } from ".";

interface SessionFeature {
  key: string;
  value: string;
}

export class MemoryTable {
  cassio: Cassio;
  name: string;
  tableName: string;
  ttl: number = 86400;

  constructor(cassio: Cassio, name: string, tableName: string, ttl?: number) {
    this.cassio = cassio;
    this.name = name;
    this.tableName = tableName;
    this.ttl = ttl || this.ttl;
  }

  async save(
    sessionId: string = randomUUID(),
    userMessage: string,
    AIAnswer: string,
    sessionFeatures?: Array<SessionFeature>
  ) {
    const stmt = `
    INSERT INTO  ${this.cassio.keyspace}.${this.tableName}
    (row_id, partition_id, body_blob)
    VALUES 
    (now(),?,?) USING TTL ${this.ttl}`;

    const result1 = await (
      await this.cassio.getSession()
    ).execute(stmt, [sessionId, `User Message: ${userMessage}`], {
      prepare: true,
    });

    const result2 = await (
      await this.cassio.getSession()
    ).execute(stmt, [sessionId, `AI Message: ${AIAnswer}`], { prepare: true });

    return sessionId;
  }
}
