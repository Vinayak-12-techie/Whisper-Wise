import { z } from "zod";

export const verifySchema = z.string().length(6, {
  message: "Verification code must be atleast 6 characters long",
});
