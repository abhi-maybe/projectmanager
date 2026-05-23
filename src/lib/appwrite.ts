import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';
import 'server-only';

import { AUTH_COOKIE } from '@/features/auth/constants';

// DB File setup
const DB_FILE = path.join(process.cwd(), 'local-db.json');

function readDb() {
  if (!fs.existsSync(DB_FILE)) {
    const initialDb = {
      users: [
        {
          $id: 'demo-user',
          email: 'demo@local.first',
          name: 'Demo Local User',
          password: 'password',
          $createdAt: new Date().toISOString()
        }
      ],
      sessions: [],
      workspaces: [],
      members: [],
      projects: [],
      tasks: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  } catch (e) {
    const initialDb = {
      users: [],
      sessions: [],
      workspaces: [],
      members: [],
      projects: [],
      tasks: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }
}

function writeDb(data: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// AST Query evaluation engine
function applyQueries(documents: any[], queries: any[]): any[] {
  let result = [...documents];

  for (const q of queries) {
    if (!q || typeof q !== 'object') continue;
    const { type, attribute, value } = q;

    if (type === 'equal') {
      result = result.filter(doc => doc[attribute] === value);
    } else if (type === 'notEqual') {
      result = result.filter(doc => doc[attribute] !== value);
    } else if (type === 'contains') {
      const valuesArray = Array.isArray(value) ? value : [value];
      result = result.filter(doc => valuesArray.includes(doc[attribute]));
    } else if (type === 'lessThan') {
      result = result.filter(doc => doc[attribute] < value);
    } else if (type === 'lessThanEqual') {
      result = result.filter(doc => doc[attribute] <= value);
    } else if (type === 'greaterThanEqual') {
      result = result.filter(doc => doc[attribute] >= value);
    } else if (type === 'search') {
      const searchStr = String(value).toLowerCase();
      result = result.filter(doc => 
        String(doc[attribute] || '').toLowerCase().includes(searchStr)
      );
    }
  }

  // Handle sorting
  for (const q of queries) {
    if (!q || typeof q !== 'object') continue;
    const { type, attribute } = q;

    if (type === 'orderDesc') {
      result.sort((a, b) => {
        const valA = a[attribute];
        const valB = b[attribute];
        if (valA < valB) return 1;
        if (valA > valB) return -1;
        return 0;
      });
    } else if (type === 'orderAsc') {
      result.sort((a, b) => {
        const valA = a[attribute];
        const valB = b[attribute];
        if (valA < valB) return -1;
        if (valA > valB) return 1;
        return 0;
      });
    }
  }

  // Handle limit
  for (const q of queries) {
    if (!q || typeof q !== 'object') continue;
    const { type, value } = q;
    if (type === 'limit') {
      result = result.slice(0, value);
    }
  }

  return result;
}

// ----------------------------------------------------
// Mock Appwrite Class Implementations
// ----------------------------------------------------

export class Client {
  private endpoint: string = '';
  private project: string = '';
  private key: string = '';
  private sessionToken: string = '';

  setEndpoint(endpoint: string) {
    this.endpoint = endpoint;
    return this;
  }

  setProject(project: string | undefined) {
    if (project) this.project = project;
    return this;
  }

  setKey(key: string | undefined) {
    if (key) this.key = key;
    return this;
  }

  setSession(token: string) {
    this.sessionToken = token;
    return this;
  }

  getSessionToken() {
    return this.sessionToken;
  }
}

export class Account {
  private client: Client;
  constructor(client: Client) {
    this.client = client;
  }

  async create(userId: string, email: string, password: any, name: string) {
    const db = readDb();
    const actualId = userId === 'unique()' || !userId ? Math.random().toString(36).substring(2, 15) : userId;

    if (db.users.find((u: any) => u.email === email)) {
      throw new Error('User already exists.');
    }

    const newUser = {
      $id: actualId,
      email,
      password,
      name,
      $createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    writeDb(db);
    return newUser;
  }

  async createEmailPasswordSession(email: string, password: any) {
    const db = readDb();
    const user = db.users.find((u: any) => u.email === email);
    if (!user || user.password !== password) {
      throw new Error('Invalid credentials.');
    }

    const secret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const newSession = {
      $id: Math.random().toString(36).substring(2, 15),
      userId: user.$id,
      secret,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    };

    db.sessions.push(newSession);
    writeDb(db);
    return newSession;
  }

  async deleteSession(sessionId: string) {
    const db = readDb();
    const token = this.client.getSessionToken();
    const index = db.sessions.findIndex((s: any) => s.secret === token || s.$id === sessionId);
    if (index !== -1) {
      db.sessions.splice(index, 1);
      writeDb(db);
    }
  }

  async get() {
    const token = this.client.getSessionToken();
    if (!token) throw new Error('Unauthorized.');

    const db = readDb();
    const session = db.sessions.find((s: any) => s.secret === token);
    if (!session) throw new Error('Unauthorized.');

    const user = db.users.find((u: any) => u.$id === session.userId);
    if (!user) throw new Error('User not found.');

    return {
      $id: user.$id,
      email: user.email,
      name: user.name,
      $createdAt: user.$createdAt,
    };
  }

  async createOAuth2Token(provider: string, successUrl: string, failureUrl: string) {
    const db = readDb();
    let demoUser = db.users.find((u: any) => u.email === 'demo@local.first');
    if (!demoUser) {
      demoUser = {
        $id: 'demo-user',
        email: 'demo@local.first',
        name: 'Demo Local User',
        password: 'password',
        $createdAt: new Date().toISOString(),
      };
      db.users.push(demoUser);
      writeDb(db);
    }

    const secret = 'mock-oauth-secret-' + Math.random().toString(36).substring(2, 15);
    const newSession = {
      $id: Math.random().toString(36).substring(2, 15),
      userId: demoUser.$id,
      secret,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    };

    db.sessions.push(newSession);
    writeDb(db);

    return `${successUrl}?userId=${demoUser.$id}&secret=${secret}`;
  }
}

export class Databases {
  private client: Client;
  constructor(client: Client) {
    this.client = client;
  }

  private getCollectionKey(collectionId: string) {
    const cid = collectionId.toLowerCase();
    if (cid.includes('member')) return 'members';
    if (cid.includes('project')) return 'projects';
    if (cid.includes('task')) return 'tasks';
    if (cid.includes('workspace')) return 'workspaces';
    return collectionId;
  }

  async listDocuments<T = any>(databaseId: string, collectionId: string, queries: any[] = []): Promise<{ total: number; documents: T[] }> {
    const db = readDb();
    const key = this.getCollectionKey(collectionId);
    const docs = db[key] || [];
    const filteredDocs = applyQueries(docs, queries);
    return {
      total: filteredDocs.length,
      documents: filteredDocs as T[],
    };
  }

  async getDocument<T = any>(databaseId: string, collectionId: string, documentId: string): Promise<T> {
    const db = readDb();
    const key = this.getCollectionKey(collectionId);
    const docs = db[key] || [];
    const doc = docs.find((d: any) => d.$id === documentId);
    if (!doc) throw new Error('Document not found.');
    return doc as T;
  }

  async createDocument<T = any>(databaseId: string, collectionId: string, documentId: string, data: any): Promise<T> {
    const db = readDb();
    const key = this.getCollectionKey(collectionId);
    if (!db[key]) db[key] = [];

    const actualId = documentId === 'unique()' || !documentId ? Math.random().toString(36).substring(2, 15) : documentId;

    const newDoc = {
      ...data,
      $id: actualId,
      $createdAt: new Date().toISOString(),
      $updatedAt: new Date().toISOString(),
    };

    db[key].push(newDoc);
    writeDb(db);
    return newDoc as T;
  }

  async updateDocument<T = any>(databaseId: string, collectionId: string, documentId: string, data: any): Promise<T> {
    const db = readDb();
    const key = this.getCollectionKey(collectionId);
    const docs = db[key] || [];
    const index = docs.findIndex((d: any) => d.$id === documentId);
    if (index === -1) throw new Error('Document not found.');

    const updatedDoc = {
      ...docs[index],
      ...data,
      $updatedAt: new Date().toISOString(),
    };

    docs[index] = updatedDoc;
    writeDb(db);
    return updatedDoc as T;
  }

  async deleteDocument(databaseId: string, collectionId: string, documentId: string): Promise<void> {
    const db = readDb();
    const key = this.getCollectionKey(collectionId);
    const docs = db[key] || [];
    const index = docs.findIndex((d: any) => d.$id === documentId);
    if (index === -1) throw new Error('Document not found.');

    docs.splice(index, 1);
    writeDb(db);
  }
}

export class Storage {
  private client: Client;
  constructor(client: Client) {
    this.client = client;
  }

  async createFile(bucketId: string, fileId: string, file: File): Promise<{ $id: string }> {
    const actualId = fileId === 'unique()' || !fileId ? Math.random().toString(36).substring(2, 15) : fileId;

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filePath = path.join(uploadsDir, actualId);

    fs.writeFileSync(filePath, buffer);

    return { $id: actualId };
  }

  async deleteFile(bucketId: string, fileId: string): Promise<void> {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadsDir, fileId);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  async getFileView(bucketId: string, fileId: string): Promise<ArrayBuffer> {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadsDir, fileId);
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found.');
    }
    const buffer = fs.readFileSync(filePath);
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
  }
}

export class Users {
  private client: Client;
  constructor(client: Client) {
    this.client = client;
  }

  async get(userId: string) {
    const db = readDb();
    const user = db.users.find((u: any) => u.$id === userId);
    if (!user) throw new Error('User not found.');
    return {
      $id: user.$id,
      email: user.email,
      name: user.name,
    };
  }
}

export class Query {
  static equal(attribute: string, value: any) {
    return { type: 'equal', attribute, value };
  }
  static contains(attribute: string, value: any) {
    return { type: 'contains', attribute, value };
  }
  static notEqual(attribute: string, value: any) {
    return { type: 'notEqual', attribute, value };
  }
  static lessThan(attribute: string, value: any) {
    return { type: 'lessThan', attribute, value };
  }
  static lessThanEqual(attribute: string, value: any) {
    return { type: 'lessThanEqual', attribute, value };
  }
  static greaterThanEqual(attribute: string, value: any) {
    return { type: 'greaterThanEqual', attribute, value };
  }
  static search(attribute: string, value: string) {
    return { type: 'search', attribute, value };
  }
  static orderDesc(attribute: string) {
    return { type: 'orderDesc', attribute };
  }
  static orderAsc(attribute: string) {
    return { type: 'orderAsc', attribute };
  }
  static limit(value: number) {
    return { type: 'limit', value };
  }
}

export const ID = {
  unique: () => 'unique()',
};

export enum OAuthProvider {
  Github = 'github',
  Google = 'google',
}

export namespace Models {
  export interface User<T = any> {
    $id: string;
    name: string;
    email: string;
    $createdAt: string;
    prefs?: T;
  }
  export interface Document {
    $id: string;
    $createdAt: string;
    $updatedAt: string;
  }
}

// ----------------------------------------------------
// Export core client generators for existing imports
// ----------------------------------------------------

export async function createSessionClient() {
  const client = new Client();
  
  let sessionToken: string | undefined = undefined;
  try {
    const cookieStore = cookies();
    sessionToken = cookieStore.get(AUTH_COOKIE)?.value;
  } catch (e) {
    // Graceful fallback outside dynamic rendering context
  }

  if (!sessionToken) throw new Error('Unauthorized.');

  client.setSession(sessionToken);

  return {
    get account() {
      return new Account(client);
    },
    get databases() {
      return new Databases(client);
    },
    get storage() {
      return new Storage(client);
    },
  };
}

export async function createAdminClient() {
  const client = new Client();
  return {
    get account() {
      return new Account(client);
    },
    get users() {
      return new Users(client);
    },
  };
}
