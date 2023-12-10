import type { Request } from "express";
import { BadRequestError } from "@/utils/errors";
import { AnyZodObject, z, ZodError } from "zod";

export type ValidateRequest<T extends AnyZodObject = any> = ({
  req,
  schema,
}: {
  req: Request;
  schema: Partial<T>;
}) => Promise<z.infer<T>>;

/**
 * Validates the provided request against the specified Zod schema.
 * @function
 * @async
 * @param {object} params - Parameters for validating the request.
 * @param {Request} params.req - The request object to be validated.
 * @param {T} [params.schema] - The Zod schema to validate against (optional).
 * @returns {Promise<z.TypeOf<T> | undefined>} - Resolves with the validated data or undefined if no schema is provided.
 * @throws {BadRequestError} - Throws a BadRequestError if validation fails.
 */
export const validate: ValidateRequest = async ({ req, schema }) => {
  try {
    if (schema) {
      const validatedData = await schema.parseAsync(req.body);
      return validatedData;
    }
    return undefined;
  } catch (error) {
    if (error instanceof ZodError) {
      throw BadRequestError({ message: error.message });
    }
    return BadRequestError({ message: JSON.stringify(error) });
  }
};
