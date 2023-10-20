import { Cassio } from ".";

enum SimilarityMetrics {
  Dot = "dot_product",
  Cosine = "cosine",
  Euclidean = "euclidean",
}

interface MetadataFilter {
  key: string;
  value: string;
}

export class VectorTable {
  cassio: Cassio;
  name: string;
  tableName: string;
  similarityMetric: SimilarityMetrics = SimilarityMetrics.Dot;
  vectorColumn: string = "vector";
  vectorDimensions: number = 1536;
  hasMetadata: boolean = false;
  embeddingGeneration: any;

  constructor(
    cassio: Cassio,
    name: string,
    tableName: string,
    similarityMetric: SimilarityMetrics,
    vectorColumn: string,
    vectorDimensions: number,
    hasMetadata: boolean = false,
    embeddingGeneration: any = {}
  ) {
    this.cassio = cassio;
    this.name = name;
    this.tableName = tableName;
    this.similarityMetric = similarityMetric;
    this.vectorColumn = vectorColumn;
    this.hasMetadata = hasMetadata;
    this.vectorDimensions = vectorDimensions;
    this.embeddingGeneration = embeddingGeneration;
  }

  async similarity_search(
    query: string,
    limit: number,
    metadata?: Array<MetadataFilter>
  ) {
    const resEmbedding = await this.cassio.getLLM().embeddings.create({
      input: query,
      model: this.embeddingGeneration["model"],
    });

    const embeddingf = new Float32Array(resEmbedding.data[0].embedding);

    const queryStmt = `
    SELECT 
           body_blob,
           similarity_${this.similarityMetric}(?, ${
      this.vectorColumn
    }) as similarity
      FROM ${this.cassio.keyspace}.${this.tableName}
    ${
      metadata && metadata.length > 0
        ? `WHERE ${metadata.map(
            (e) => `metadata_s['${e.key}'] = '${e.value}'`
          )} `
        : ""
    }
    ORDER BY ${this.vectorColumn} ANN OF ? 
    LIMIT ${limit}`;

    const result = await (
      await this.cassio.getSession()
    ).execute(queryStmt, [embeddingf, embeddingf]);
    return result.rows;
  }
}
