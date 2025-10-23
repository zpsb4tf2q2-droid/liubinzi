import { PrismaClient, TaskStatus } from "@prisma/client";

export type DemoSeedResult = {
  users: Record<string, Awaited<ReturnType<PrismaClient["user"]["create"]>>>;
  projects: Record<string, Awaited<ReturnType<PrismaClient["project"]["create"]>>>;
  tasks: Record<string, Awaited<ReturnType<PrismaClient["task"]["create"]>>>;
};

type DemoUserSeed = {
  key: string;
  email: string;
  name: string;
};

type DemoProjectSeed = {
  key: string;
  owner: string;
  name: string;
  description: string;
};

type DemoTaskSeed = {
  key: string;
  project: string;
  assignee?: string;
  title: string;
  description: string;
  status: TaskStatus;
  dueDate?: string;
};

export const DEMO_USERS: readonly DemoUserSeed[] = [
  {
    key: "alex",
    email: "alex.morgan@example.com",
    name: "Alex Morgan",
  },
  {
    key: "jamie",
    email: "jamie.liu@example.com",
    name: "Jamie Liu",
  },
  {
    key: "riley",
    email: "riley.patel@example.com",
    name: "Riley Patel",
  },
];

export const DEMO_PROJECTS: readonly DemoProjectSeed[] = [
  {
    key: "marketing-website",
    owner: "alex",
    name: "Marketing Site Refresh",
    description: "Revamp the company marketing site to highlight the Q4 product launch.",
  },
  {
    key: "mobile-onboarding",
    owner: "jamie",
    name: "Mobile Onboarding Flow",
    description: "Streamline user onboarding for the mobile application.",
  },
  {
    key: "ops-dashboard",
    owner: "alex",
    name: "Operations Dashboard",
    description: "Build a real-time dashboard consolidating support metrics.",
  },
];

export const DEMO_TASKS: readonly DemoTaskSeed[] = [
  {
    key: "wireframes",
    project: "marketing-website",
    assignee: "alex",
    title: "Finalize landing page wireframes",
    description: "Produce hi-fidelity wireframes for hero and pricing sections.",
    status: TaskStatus.IN_PROGRESS,
    dueDate: "2024-11-04T00:00:00.000Z",
  },
  {
    key: "copy",
    project: "marketing-website",
    assignee: "jamie",
    title: "Draft updated messaging",
    description: "Create compelling copy for the refreshed landing page.",
    status: TaskStatus.TODO,
    dueDate: "2024-11-08T00:00:00.000Z",
  },
  {
    key: "accessibility",
    project: "marketing-website",
    assignee: "riley",
    title: "Accessibility audit",
    description: "Run an accessibility audit and capture remediation items.",
    status: TaskStatus.TODO,
  },
  {
    key: "prototype",
    project: "mobile-onboarding",
    assignee: "jamie",
    title: "Interactive prototype",
    description: "Build a prototype covering the first three onboarding steps.",
    status: TaskStatus.IN_PROGRESS,
    dueDate: "2024-11-12T00:00:00.000Z",
  },
  {
    key: "beta-feedback",
    project: "mobile-onboarding",
    assignee: "alex",
    title: "Synthesize beta feedback",
    description: "Summarize onboarding feedback from closed beta participants.",
    status: TaskStatus.DONE,
  },
  {
    key: "alerts",
    project: "ops-dashboard",
    assignee: "riley",
    title: "Implement alert rules",
    description: "Configure alert thresholds for response time and CSAT metrics.",
    status: TaskStatus.TODO,
  },
  {
    key: "datasync",
    project: "ops-dashboard",
    title: "Data sync reliability",
    description: "Investigate occasional sync failures from the CRM ingestion job.",
    status: TaskStatus.IN_PROGRESS,
    dueDate: "2024-11-15T00:00:00.000Z",
  },
];

export async function resetDatabase(prisma: PrismaClient) {
  await prisma.$transaction([
    prisma.task.deleteMany(),
    prisma.project.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

export async function seedDemoData(prisma: PrismaClient): Promise<DemoSeedResult> {
  const users: DemoSeedResult["users"] = {};
  for (const user of DEMO_USERS) {
    users[user.key] = await prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
      },
    });
  }

  const projects: DemoSeedResult["projects"] = {};
  for (const project of DEMO_PROJECTS) {
    const owner = users[project.owner];
    projects[project.key] = await prisma.project.create({
      data: {
        name: project.name,
        description: project.description,
        ownerId: owner.id,
      },
    });
  }

  const tasks: DemoSeedResult["tasks"] = {};
  for (const task of DEMO_TASKS) {
    const project = projects[task.project];
    const assignee = task.assignee ? users[task.assignee] : undefined;

    tasks[task.key] = await prisma.task.create({
      data: {
        title: task.title,
        description: task.description,
        status: task.status,
        projectId: project.id,
        ...(assignee ? { assigneeId: assignee.id } : {}),
        ...(task.dueDate ? { dueDate: new Date(task.dueDate) } : {}),
      },
    });
  }

  return { users, projects, tasks };
}

export type { DemoProjectSeed, DemoTaskSeed, DemoUserSeed };
