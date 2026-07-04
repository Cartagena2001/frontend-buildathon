import type { WithId } from "mongodb";

export interface User {
  email: string;
  name?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = WithId<User>;

export type CreateUserInput = Pick<User, "email"> &
  Partial<Pick<User, "name" | "imageUrl">>;
