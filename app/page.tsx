import prisma from '@/lib/prisma';

export default async function Home() {
  // Database call
  const users = await prisma.user.findMany();
  return (
    <main>
      <h1>Users</h1>
      {users.map((user) => (
        <div key={user.id}>
          {user.name} ({user.email})
        </div>
      ))}
    </main>
  );
}