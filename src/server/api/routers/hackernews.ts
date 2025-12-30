import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { unstable_cache } from "next/cache";

export const HNItemSchema = z.object({
  id: z.number(),
  deleted: z.boolean().optional(),
  type: z.enum(["job", "story", "comment", "poll", "pollopt"]).optional(),
  by: z.string().optional(),
  time: z.number().optional(),
  text: z.string().optional(),
  dead: z.boolean().optional(),
  parent: z.number().optional(),
  poll: z.number().optional(),
  kids: z.array(z.number()).optional(),
  url: z.string().optional(),
  score: z.number().optional(),
  title: z.string().optional(),
  parts: z.array(z.number()).optional(),
  descendants: z.number().optional(),
});

export type HNItem = z.infer<typeof HNItemSchema>;

const getTopStoriesIds = unstable_cache(
  async () => {
    const res = await fetch(
      "https://hacker-news.firebaseio.com/v0/topstories.json",
      { next: { revalidate: 60 } },
    );
    return (await res.json()) as number[];
  },
  ["hn-top-stories"],
  { revalidate: 60 },
);

const getStoryItem = unstable_cache(
  async (id: number): Promise<unknown> => {
    const res = await fetch(
      `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
      { next: { revalidate: 3600 } },
    );
    return await res.json();
  },
  ["hn-item"],
  { revalidate: 3600 },
);

export const hackerNewsRouter = createTRPCRouter({
  getTopStories: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        cursor: z.number().nullish(),
      }),
    )
    .query(async ({ input }) => {
      const { limit, cursor } = input;
      const skip = cursor ?? 0;

      const topStoriesIds = await getTopStoriesIds();

      const slicedIds = topStoriesIds.slice(skip, skip + limit);

      const storiesRaw = await Promise.all(
        slicedIds.map((id) => getStoryItem(id)),
      );

      const stories = storiesRaw
        .map((s) => HNItemSchema.safeParse(s))
        .filter(
          (result): result is { success: true; data: HNItem } =>
            result.success &&
            result.data.type === "story" &&
            !result.data.dead &&
            !result.data.deleted,
        )
        .map((result) => result.data);

      return {
        stories,
        nextCursor: skip + limit < topStoriesIds.length ? skip + limit : null,
      };
    }),
});
