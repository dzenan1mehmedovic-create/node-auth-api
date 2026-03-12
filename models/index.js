import { pgTable, serial, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  firstname: varchar("firstname", { length: 255 }).notNull(),
  lastname: varchar("lastname", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  salt: text("salt").notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
