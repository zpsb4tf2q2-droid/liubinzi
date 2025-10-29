export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
}

const users: Record<string, UserProfile> = {
  'user-1': {
    id: 'user-1',
    email: 'demo.user@example.com',
    name: 'Demo User',
    role: 'member',
  },
};

export const getUserById = async (userId: string): Promise<UserProfile | null> => {
  const user = users[userId];

  if (!user) {
    return null;
  }

  return user;
};
