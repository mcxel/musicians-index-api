export default function IssueTabs() {
  const tabs = ["ISSUE 88", "TOP 10", "CYTHER", "LIVE", "DISCOVERY"];

  return (
    <div className="mag-issue-tabs" aria-label="Issue Tabs">
      {tabs.map((tab, index) => (
        <span key={tab} className={`mag-issue-tab mag-issue-tab--${index % 5}`}>
          {tab}
        </span>
      ))}
    </div>
  );
}
