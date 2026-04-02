$base = "C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform\apps\web\src\app\rooms"
$enc = [System.Text.Encoding]::UTF8

function Write-Page($dir, $title) {
  $path = "$base\$dir\page.tsx"
  $c = "export default function Page() {`n  return (`n    <main className=`"min-h-screen bg-[#0a0a0f] text-white px-6 py-10`">`n      <h1 className=`"text-3xl font-bold text-[#ff6b35] mb-4`">$title</h1>`n      <p className=`"text-gray-400`">This room is coming soon.</p>`n    </main>`n  );`n}`n"
  [System.IO.Directory]::CreateDirectory("$base\$dir") | Out-Null
  [System.IO.File]::WriteAllText($path, $c, $enc)
  Write-Host "OK: $dir"
}

Write-Page "audience" "Audience Room"
Write-Page "backstage" "Backstage Room"
Write-Page "band" "Band Room"
Write-Page "collaboration" "Collaboration Room"
Write-Page "contest-performance" "Contest Performance Room"
Write-Page "cover-art-zoom" "Cover Art Zoom Room"
Write-Page "cypher" "Cypher Room"
Write-Page "deal-or-feud" "Deal or Feud Room"
Write-Page "dj" "DJ Room"
Write-Page "front-row" "Front Row Room"
Write-Page "game" "Game Room"
Write-Page "interview" "Interview Room"
Write-Page "listening-party" "Listening Party Room"
Write-Page "live-concert" "Live Concert Room"
Write-Page "lyric-fill" "Lyric Fill Room"
Write-Page "name-that-tune" "Name That Tune Room"
Write-Page "party-lobby" "Party Lobby"
Write-Page "producer" "Producer Room"
Write-Page "sponsor-event" "Sponsor Event Room"
Write-Page "studio" "Studio Room"
Write-Page "trivia" "Trivia Room"
Write-Page "vip" "VIP Room"
Write-Page "watch-party" "Watch Party Room"

$slugPath = "$base\[slug]\page.tsx"
$slugC = "export default function RoomPage({ params }: { params: { slug: string } }) {`n  return (`n    <main className=`"min-h-screen bg-[#0a0a0f] text-white px-6 py-10`">`n      <h1 className=`"text-3xl font-bold text-[#ff6b35] mb-4`">Room: {params.slug}</h1>`n      <p className=`"text-gray-400`">Loading room&hellip;</p>`n    </main>`n  );`n}`n"
[System.IO.Directory]::CreateDirectory("$base\[slug]") | Out-Null
[System.IO.File]::WriteAllText($slugPath, $slugC, $enc)
Write-Host "OK: [slug]"

$reviewsPath = "C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform\apps\web\src\app\reviews\page.tsx"
$reviewsC = "export default function Page() {`n  return (`n    <main className=`"min-h-screen bg-[#0a0a0f] text-white px-6 py-10`">`n      <h1 className=`"text-3xl font-bold text-[#ff6b35] mb-4`">Reviews</h1>`n      <p className=`"text-gray-400`">Reviews coming soon.</p>`n    </main>`n  );`n}`n"
[System.IO.Directory]::CreateDirectory("C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform\apps\web\src\app\reviews") | Out-Null
[System.IO.File]::WriteAllText($reviewsPath, $reviewsC, $enc)
Write-Host "OK: reviews"

Write-Host "DONE"