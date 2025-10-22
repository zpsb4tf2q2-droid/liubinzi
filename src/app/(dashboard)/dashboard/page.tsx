import DashboardShell from '@/components/dashboard/dashboard-shell';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function DashboardPage(): Promise<JSX.Element> {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    include: {
      tasks: {
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const serializedProjects = projects.map((project) => ({
    id: project.id,
    name: project.name,
    description: project.description,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    tasks: project.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    })),
  }));

  return (
    <DashboardShell
      user={{ id: user.id, email: user.email, name: user.name }}
      projects={serializedProjects}
    />
  );
}
