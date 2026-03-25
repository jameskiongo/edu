import { type FormikConfig, type FormikValues, useFormik } from "formik";
import type { ZodSchema } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";

interface UseAppFormOptions<T extends FormikValues> {
  initialValues: T;
  schema: ZodSchema<T>;
  onSubmit: FormikConfig<T>["onSubmit"];
}

export function useAppForm<T extends FormikValues>({
  initialValues,
  schema,
  onSubmit,
}: UseAppFormOptions<T>) {
  return useFormik<T>({
    initialValues,
    validationSchema: toFormikValidationSchema(schema),
    onSubmit,
  });
}
