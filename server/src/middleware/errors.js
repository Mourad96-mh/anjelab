export function notFound(req, res) {
  res.status(404).json({ message: "Route inconnue." });
}

// Central error handler: technical detail goes to the logs, the client only
// receives a generic message.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err.message?.startsWith("Origine non autorisée")) {
    return res.status(403).json({ message: "Origine non autorisée." });
  }
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Corps de requête JSON invalide." });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: "Cette valeur existe déjà (identifiant déjà utilisé)." });
  }
  if (err.name === "ValidationError") {
    const errors = Object.fromEntries(Object.entries(err.errors).map(([k, e]) => [k, e.message]));
    return res.status(422).json({ message: "Données invalides.", errors });
  }
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Identifiant invalide." });
  }
  console.error("[API]", err);
  return res.status(500).json({ message: "Erreur serveur." });
}
