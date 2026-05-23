import { hc } from 'hono/client';

import type { AppType } from '@/app/api/[[...route]]/route';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost:3000';
};

export const client = hc<AppType>(getBaseUrl());
