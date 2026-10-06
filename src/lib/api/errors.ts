import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fields?: Record<string, string>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function jsonError(
  status: number,
  code: string,
  message: string,
  fields?: Record<string, string>
) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(fields ? { fields } : {}),
      },
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

export function handleApiRoute<T = unknown>(
  handler: (request: Request, context: T) => Promise<NextResponse>
) {
  return async (request: Request, context: T) => {
    try {
      return await handler(request, context);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        return jsonError(err.status, err.code, err.message, err.fields);
      }

      if (err instanceof ZodError) {
        const fields: Record<string, string> = {};
        for (const issue of err.issues) {
          const fieldName = issue.path.join(".") || "body";
          if (!fields[fieldName]) {
            fields[fieldName] = issue.message;
          }
        }
        return jsonError(
          422,
          "VALIDATION_ERROR",
          "Datanya belum valid. Cek lagi isiannya ya.",
          fields
        );
      }

      console.error("Unhandled API Error:", err);
      return jsonError(
        500,
        "INTERNAL_ERROR",
        "Ada masalah di server. Coba lagi sebentar lagi."
      );
    }
  };
}
