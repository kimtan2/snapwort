import Dexie, { Table } from 'dexie';

export interface Word {
  id?: number;
  word: string;
  meaning: string;
  language: 'en' | 'de';
  createdAt: Date;
}

export class SnapWortDB extends Dexie {
  words!: Table<Word>;

  constructor() {
    super('snapwort');
    this.version(1).stores({
      words: '++id, word, language, createdAt'
    });
  }
}

export const db = new SnapWortDB(); 