import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import DashboardNav from '@/components/DashboardNav';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  
  if (!user) {
    redirect('/');
  }

  // Extract only the necessary user data as plain objects
  const userData = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    emailAddresses: user.emailAddresses.map(email => ({
      emailAddress: email.emailAddress,
    })),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav user={userData} />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
