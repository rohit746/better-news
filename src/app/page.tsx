import { NewsFeed } from "~/app/_components/feed";
import { api, HydrateClient } from "~/trpc/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  await api.hackernews.getTopStories.prefetchInfinite({ limit: 20 });

  return (
    <HydrateClient>
      <div className="space-y-12">
        <section className="space-y-4 md:space-y-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              TOP_STORIES
            </h2>
            <div className="bg-primary h-1 w-24" />
          </div>
          <p className="text-muted-foreground max-w-[42rem] leading-relaxed md:text-xl">
            Curated intelligence from the hacker community. Real-time data
            stream of technology, science, and engineering news.
          </p>
        </section>

        <NewsFeed />
      </div>
    </HydrateClient>
  );
}
