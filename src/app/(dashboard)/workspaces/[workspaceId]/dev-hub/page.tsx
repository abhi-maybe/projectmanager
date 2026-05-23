import { redirect } from 'next/navigation';

import { getCurrent } from '@/features/auth/queries';

import { DeveloperHubClient } from './client';

const DeveloperHubPage = async () => {
  const user = await getCurrent();

  if (!user) redirect('/sign-in');

  return <DeveloperHubClient />;
};

export default DeveloperHubPage;
