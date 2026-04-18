import { usersController } from '@/features/users/transport/users.controller';

export const GET = usersController.getById;
export const PATCH = usersController.update;
export const DELETE = usersController.remove;
