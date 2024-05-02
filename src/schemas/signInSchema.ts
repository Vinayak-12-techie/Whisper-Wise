import { z } from "zod";

export const signInSchema = z.object({
  identifier: z.string().email({ message: "Invalid Email Address" }),
  password: z.string(),
});
