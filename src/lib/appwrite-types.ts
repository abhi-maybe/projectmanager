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
  export type Preferences = any;
}
