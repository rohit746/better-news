"use client";

import React, { memo } from "react";
import { api } from "~/trpc/react";
import type { HNItem } from "~/server/api/routers/hackernews";
import { MessageSquare, ArrowUpRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { Card, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { Button } from "~/components/ui/button";

const formatTime = (time: number | undefined) => {
  if (!time) return "";
  return formatDistanceToNow(new Date(time * 1000), {
    addSuffix: true,
  }).replace("about ", "");
};

const getDomain = (url: string | undefined) => {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "";
  }
};

const StoryCard = memo(function StoryCard({
  story,
  index,
}: {
  story: HNItem;
  index: number;
}) {
  if (!story.title) return null;

  return (
    <Card className="group border-border hover:bg-muted/50 relative mb-0 overflow-hidden rounded-none border-b bg-transparent shadow-none transition-colors last:border-0">
      <div className="bg-primary absolute top-0 left-0 h-full w-[3px] scale-y-0 transition-transform duration-300 group-hover:scale-y-100" />
      <CardHeader className="py-5 pr-4 pl-6">
        <div className="flex items-start gap-5">
          <span className="text-muted-foreground/40 w-6 pt-1 font-mono text-sm font-bold">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="flex-1 space-y-2">
            <div className="text-muted-foreground flex items-center gap-3 text-[10px] font-bold tracking-wider uppercase">
              {story.url && (
                <span className="text-primary flex items-center gap-1">
                  {getDomain(story.url)}
                </span>
              )}
              <span className="bg-border h-1 w-1 rounded-full" />
              <span className="flex items-center gap-1">
                {formatTime(story.time)}
              </span>
            </div>

            <CardTitle className="group-hover:text-primary text-xl leading-snug font-medium tracking-tight transition-colors">
              {story.url ? (
                <a
                  href={story.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2"
                >
                  {story.title}
                  <ArrowUpRight className="h-4 w-4 translate-x-1 -translate-y-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
                </a>
              ) : (
                <span>{story.title}</span>
              )}
            </CardTitle>

            <div className="text-muted-foreground flex items-center gap-4 pt-1 text-xs font-medium">
              <span className="flex items-center gap-1.5" title="Score">
                <span className="text-foreground font-mono">
                  {story.score ?? 0}
                </span>{" "}
                points
              </span>
              <span className="flex items-center gap-1.5" title="Comments">
                <MessageSquare className="h-3 w-3" />
                <span className="text-foreground font-mono">
                  {story.descendants ?? 0}
                </span>{" "}
                comments
              </span>
              <span className="ml-auto font-mono text-[10px] opacity-50">
                BY {story.by?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
});

function FeedSkeleton() {
  return (
    <div className="divide-border border-border space-y-0 divide-y border-t border-b">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="px-4 py-6">
          <div className="flex gap-4">
            <Skeleton className="h-4 w-6 rounded-none" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-3 w-24 rounded-none" />
              <Skeleton className="h-6 w-3/4 rounded-none" />
              <div className="flex gap-4">
                <Skeleton className="h-3 w-12 rounded-none" />
                <Skeleton className="h-3 w-12 rounded-none" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function NewsFeed() {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = api.hackernews.getTopStories.useInfiniteQuery(
    { limit: 20 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  );

  if (isLoading) return <FeedSkeleton />;
  if (isError)
    return (
      <div className="text-destructive border-destructive/20 bg-destructive/5 border py-12 text-center font-mono text-sm tracking-widest uppercase">
        System Malfunction: Unable to retrieve data stream
      </div>
    );

  let cumulativeIndex = 0;

  return (
    <div className="space-y-12">
      <div className="border-border border-t">
        {data?.pages.map((page, i) => (
          <div key={i} className="divide-border divide-y">
            {page.stories.map((story) => {
              const currentIndex = cumulativeIndex;
              cumulativeIndex++;
              return (
                <StoryCard key={story.id} story={story} index={currentIndex} />
              );
            })}
          </div>
        ))}
      </div>

      {hasNextPage && (
        <div className="flex justify-center pt-8 pb-12">
          <Button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground h-12 rounded-none px-8 font-mono text-xs tracking-widest uppercase transition-all active:scale-95"
          >
            {isFetchingNextPage
              ? "Retrieving Data..."
              : "Load Additional Stories"}
          </Button>
        </div>
      )}

      {!hasNextPage && (
        <div className="text-muted-foreground border-border border-b py-12 text-center font-mono text-xs tracking-widest uppercase">
          End of Transmission
        </div>
      )}
    </div>
  );
}
