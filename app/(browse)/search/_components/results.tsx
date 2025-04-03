import {getSearch} from "@/lib/search-service";
import React from "react";
import ResultCard, {ResultCardSkeleton} from "./result-card";
import {Skeleton} from "@/components/ui/skeleton";
import {auth} from "@clerk/nextjs";

type Props = {
  term?: string;
};

async function Results({term}: Props) {
  const data = await getSearch(term);
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">
        Results for term &quot;{term}&quot;
      </h2>

      {data.length === 0 && (
        <p className="text-muted-foreground text-sm">
          No results found! Try searching for something else.
        </p>
      )}
      <div className="flex flex-col gap-y-4">
        {data.map((result) => (
          <ResultCard data={result} key={result.id} />
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
      <div className="flex flex-col gap-y-4">
        {[...Array(4)].map((_, i) => (
          <ResultCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};
