import { Request } from 'express';
import { AuthenticatedUser } from './authenticated-user.interface';

export type RequestWithUser = Request & {
  user?: AuthenticatedUser;
};
