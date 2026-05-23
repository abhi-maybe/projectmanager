import { type Models } from '@/lib/appwrite';

export type Workspace = Models.Document & {
  name: string;
  imageId?: string;
  imageUrl?: string;
  userId: string;
  inviteCode: string;
};
