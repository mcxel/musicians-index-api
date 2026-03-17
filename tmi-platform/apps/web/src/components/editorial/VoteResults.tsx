// tmi-platform/apps/web/src/components/editorial/VoteResults.tsx
'use client';

type Result = {
  stageName: string;
  voteCount: number;
};

type VoteResultsProps = {
  results: Result[] | null;
};

export function VoteResults({ results }: VoteResultsProps) {
  if (!results || results.length === 0) {
    return <p>No results available.</p>;
  }

  const totalVotes = results.reduce((sum, result) => sum + result.voteCount, 0);
  const topThree = results.slice(0, 3);

  return (
    <div className="space-y-4">
      {topThree.map((result, index) => {
        const percentage = totalVotes > 0 ? (result.voteCount / totalVotes) * 100 : 0;
        return (
          <div key={result.stageName}>
            <div className="flex justify-between items-baseline mb-1">
              <p className="font-bold">
                <span className="text-lg mr-2">{index + 1}.</span>
                {result.stageName}
              </p>
              <p className="text-sm text-gray-400">{result.voteCount.toLocaleString()} votes</p>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4">
              <div
                className="bg-blue-500 h-4 rounded-full"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
