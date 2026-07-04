import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;

function getMongoUri(): string {
  if (!uri) {
    throw new Error("Define MONGODB_URI en .env (copia desde .env.example)");
  }
  return uri;
}

const options = {};

const globalForMongo = globalThis as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

function createClientPromise(): Promise<MongoClient> {
  const client = new MongoClient(getMongoUri(), options);
  return client.connect();
}

const clientPromise: Promise<MongoClient> =
  process.env.NODE_ENV === "development"
    ? (globalForMongo._mongoClientPromise ??= createClientPromise())
    : createClientPromise();

export default clientPromise;

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  const dbName = process.env.MONGODB_DB_NAME ?? "findy";
  return client.db(dbName);
}
