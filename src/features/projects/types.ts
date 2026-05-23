import { type Models } from '@/lib/appwrite';

export type Project = Models.Document & {
  name: string;
  imageId?: string;
  imageUrl?: string;
  workspaceId: string;
};
