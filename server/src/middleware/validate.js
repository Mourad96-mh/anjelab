// Runs a zod schema on req.body. On success req.body is REPLACED by the parsed
// value, so unknown fields never reach the database (whitelist by design).
export default function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body ?? {});
    if (result.success) {
      req.body = result.data;
      return next();
    }
    const errors = {};
    for (const issue of result.error.issues) {
      const field = issue.path.join(".") || "_";
      if (!errors[field]) errors[field] = issue.message;
    }
    return res.status(422).json({ message: "Certains champs sont incorrects.", errors });
  };
}
