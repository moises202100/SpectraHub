import { getStreams } from "@/lib/feed-service";
import React from "react";
import ResultCard, { ResultCardSkeleton } from "./result-card";
import { Skeleton } from "@/components/ui/skeleton";

async function Results() {
  const data = await getStreams();
  const verifiedStreams = data.filter((stream) => stream.user.isVerifiedModel);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">
        Verified Models Live Now
      </h2>
      {verifiedStreams.length === 0 && (
        <div className="text-muted-foreground text-sm">No verified models are streaming right now</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {verifiedStreams.map((result) => (
          <ResultCard key={result.id} data={result} />
        ))}
      </div>
    </div>
  );
}

export default Results;

export const ResultsSkeleton = () => {
  return (
    <div>
      <Skeleton className="h-8 w-[290px] mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
          <ResultCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};