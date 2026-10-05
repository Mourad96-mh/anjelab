import { revalidatePath, revalidateTag } from "next/cache";

// Called by the Express API after any catalogue write (server/src/services/revalidate.js).
export async function POST(request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || request.headers.get("x-revalidate-secret") !== secret) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }
  // Every public page reads the catalogue through the "catalogue" fetch tag,
  // so purging the tag refreshes them all; the layout purges also clear the
  // full-route cache of pages already rendered. Public pages live in the
  // (site) route group, which revalidatePath("/", "layout") does NOT reach.
  revalidateTag("catalogue");
  revalidatePath("/", "layout");
  revalidatePath("/(site)", "layout");
  return Response.json({ revalidated: true, at: new Date().toISOString() });
}
