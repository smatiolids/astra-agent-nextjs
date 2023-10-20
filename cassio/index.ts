import { Client, ClientOptions } from "cassandra-driver";
import fs from "fs";
import OpenAI from "openai";
import { VectorTable } from "./vectorTable";
import { MemoryTable } from "./memoryTable";

type VectorObject = {
  [key: string]: VectorTable;
};

type MemoryObject = {
  [key: string]: MemoryTable;
};

export class Cassio {
  static cassandra: Client | null = null;
  vectorSpace: VectorObject = {};
  memorySpace: MemoryObject = {};
  llm: OpenAI | null = null;
  keyspace: string = process.env.ASTRA_DB_KEYSPACE || "demo";

  constructor() {
    try {
      console.log("Initializing Cassio");
      (async () => {
        await this.getSession();
      })();

      let metadata;

      if (process.env.CASSIO_METADATA_FILE) {
        const rawData = fs.readFileSync("./cassio/metadata.json", "utf8");
        metadata = JSON.parse(rawData);
      } else if (process.env.CASSIO_METADATA_COLLECTION) {
        // Loading from STARGATE JSON API to be implemented
        console.log("JSON API not implemented");
      } else {
        throw "Cassio metadata not found";
      }

      // Loading VectorSpace
      this.initializeVectorSpace(metadata);

      // Loading memorySpace
      this.initializeMemorySpace(metadata);

      console.log("Initialized Cassio");
    } catch (error) {
      console.log(error);
    }
  }

  private initializeVectorSpace(metadata: any) {
    this.vectorSpace = metadata.vectorTables.reduce((acc: any, data: any) => {
      acc[data.name] = new VectorTable(
        this,
        data.name,
        data.tableName,
        data.similarityMetric,
        data.vectorColumn,
        data.vectorDimensions,
        data.hasMetadata,
        data.embeddingGeneration || {}
      );
      return acc;
    }, {});

    console.log(this.vectorSpace);
  }

  private initializeMemorySpace(metadata: any) {
    this.memorySpace = metadata.memoryTables.reduce((acc: any, data: any) => {
      acc[data.name] = new MemoryTable(this, data.name, data.tableName);
      return acc;
    }, {});

    console.log(this.memorySpace);
  }

  public async getSession(): Promise<Client> {
    if (!Cassio.cassandra) {
      Cassio.cassandra = new Client({
        cloud: {
          secureConnectBundle: process.env.ASTRA_DB_SECURE_BUNDLE_PATH!,
        },
        credentials: {
          username: process.env.ASTRA_DB_CLIENT_ID!,
          password: process.env.ASTRA_DB_CLIENT_SECRET!,
        },
      });
      try {
        await Cassio.cassandra.connect();
        console.log("Connected to Cassandra");
        return Cassio.cassandra;
      } catch (error) {
        console.error("Error connecting to Cassandra:", error);
      }
    } else {
      return Cassio.cassandra;
    }
  }

  getLLM(): OpenAI {
    if (!this.llm) {
      this.llm = new OpenAI({
        apiKey: process.env.OPEN_AI_KEY!,
      });
      return this.llm;
    } else {
      return this.llm;
    }
  }
}

const cassio = new Cassio();

export default cassio;
