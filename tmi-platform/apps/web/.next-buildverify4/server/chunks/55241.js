"use strict";exports.id=55241,exports.ids=[55241],exports.modules={955241:(e,t,n)=>{n.d(t,{Cz:()=>h});var o=n(706113);let r=new Map,i={count:0,windowStart:Date.now()};setInterval(()=>{let e=Date.now();for(let[t,n]of r)e-n.windowStart>12e4&&r.delete(t)},3e5);var a=n(665641);let s=new Set(["mailinator.com","guerrillamail.com","10minutemail.com","throwam.com","yopmail.com","sharklasers.com","guerrillamailblock.com","grr.la","spam4.me","trashmail.com","fakemail.net","mailnull.com","maildrop.cc","spamgourmet.com","dispostable.com","mailnesia.com","spaml.de","wegwerfmail.de","trashmail.me","spamspot.com","ezztt.com","discard.email","spamfree24.org","emailondeck.com","tempinbox.com","getairmail.com","filzmail.com","mailexpire.com","spamherelots.com","tempemail.co","tempmail.com","temp-mail.org","throwaway.email"]),l=process.env.NEXTAUTH_URL??"https://themusiciansindex.com";function c(e,t,n="#06b6d4"){return`<table cellpadding="0" cellspacing="0" style="margin-top:20px;"><tr><td><a href="${t}" style="display:inline-block;padding:14px 32px;background:${n};color:#000000;font-weight:900;font-size:11px;text-decoration:none;border-radius:10px;letter-spacing:0.15em;text-transform:uppercase;box-shadow:0 0 20px ${n}66;">${e} &rarr;</a></td></tr></table>`}function d(e,t="#ffffff"){return`<h1 style="margin:0 0 14px;font-size:24px;font-weight:900;color:${t};line-height:1.15;letter-spacing:-0.01em;">${e}</h1>`}function p(e){return`<p style="margin:0 0 14px;font-size:13px;color:rgba(255,255,255,0.65);line-height:1.7;">${e}</p>`}function u(e,t){return`<span style="display:inline-block;padding:4px 10px;background:${t}20;color:${t};font-size:9px;font-weight:900;border-radius:6px;letter-spacing:0.2em;text-transform:uppercase;border:1px solid ${t}40;">${e}</span><br/><br/>`}function m(e,t){return`<div style="display:inline-block;font-size:7px;font-weight:900;letter-spacing:0.4em;color:${t};border:1px solid ${t}55;border-radius:4px;padding:4px 10px;text-transform:uppercase;margin-bottom:14px;">${e}</div><br/>`}function g(e,t="#00FFFF"){return`<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${t}28;border-radius:12px;overflow:hidden;margin:16px 0;">
    ${e.map(([e,t],n)=>`<tr style="background:${n%2==0?"rgba(255,255,255,0.02)":"transparent"};">
      <td style="padding:10px 16px;font-size:10px;color:rgba(255,255,255,0.4);letter-spacing:0.1em;text-transform:uppercase;width:130px;">${e}</td>
      <td style="padding:10px 16px;font-size:13px;color:#ffffff;font-weight:700;">${t}</td>
    </tr>`).join("")}
  </table>`}function $(e,t,n="#06b6d4"){let r=new Date().getFullYear(),i=new Date().toLocaleDateString("en-US",{month:"long",year:"numeric"}).toUpperCase(),a=function(e){let t=function(e){let t=process.env.NEXTAUTH_SECRET??"fallback-secret";return(0,o.createHmac)("sha256",t).update(e).digest("hex").slice(0,16)}(e),n=process.env.NEXTAUTH_URL??"https://themusiciansindex.com";return`${n}/unsubscribe?email=${encodeURIComponent(e)}&token=${t}`}(t);return`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>The Musician's Index</title>
</head>
<body style="margin:0;padding:0;background:#050510;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#050510;">
<tr><td align="center" style="padding:28px 16px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#0a0818;border-radius:16px;border:1px solid rgba(255,255,255,0.07);overflow:hidden;">

<!-- MASTHEAD -->
<tr><td style="background:linear-gradient(135deg,#04030f 0%,#0d0928 100%);padding:24px 32px 20px;">
<table width="100%" cellpadding="0" cellspacing="0"><tr>
<td valign="middle">
<p style="margin:0;font-size:7px;letter-spacing:0.55em;color:rgba(255,255,255,0.2);text-transform:uppercase;font-weight:700;">BerntoutGlobal LLC</p>
<p style="margin:5px 0 0;font-size:26px;font-weight:900;letter-spacing:0.05em;color:#ffffff;text-shadow:2px 2px 0 #FF2DAA,-2px -2px 0 #00FFFF;text-transform:uppercase;line-height:1;">THE MUSICIAN'S INDEX</p>
<p style="margin:6px 0 0;font-size:8px;letter-spacing:0.3em;color:${n};text-transform:uppercase;font-weight:700;">DIGITAL EDITION &nbsp;&middot;&nbsp; ${i}</p>
</td>
<td align="right" valign="middle">
<div style="width:48px;height:48px;border-radius:50%;background:${n}18;border:1.5px solid ${n}55;text-align:center;line-height:48px;font-size:22px;">🎤</div>
</td>
</tr></table>
</td></tr>

<!-- RAINBOW ACCENT STRIP -->
<tr><td style="padding:0;line-height:0;font-size:0;"><div style="height:3px;background:linear-gradient(90deg,#00FFFF,#FF2DAA,#FFD700,#AA2DFF,#00FFFF);"></div></td></tr>

<!-- CONTENT -->
<tr><td style="padding:32px;">${e}</td></tr>

<!-- BOTTOM DIVIDER -->
<tr><td style="padding:0 32px;line-height:0;font-size:0;"><div style="height:1px;background:linear-gradient(90deg,transparent,${n}30,transparent);"></div></td></tr>

<!-- FOOTER -->
<tr><td style="padding:18px 32px 22px;background:rgba(0,0,0,0.4);">
<p style="margin:0;font-size:9px;color:rgba(255,255,255,0.18);line-height:1.8;">
&copy; ${r} BerntoutGlobal LLC &nbsp;&middot;&nbsp; The Musician's Index<br/>
<a href="https://themusiciansindex.com" style="color:${n};text-decoration:none;">themusiciansindex.com</a>
&nbsp;&middot;&nbsp;
<a href="${a}" style="color:rgba(255,255,255,0.25);text-decoration:none;">Unsubscribe</a>
&nbsp;&middot;&nbsp;
<a href="${l}/settings/notifications" style="color:rgba(255,255,255,0.25);text-decoration:none;">Manage Preferences</a>
</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`}let f={welcome_artist:(e,t)=>({subject:"Welcome to The Musician's Index — Your Stage Is Ready \uD83C\uDFA4",html:$(`
      ${m("ARTIST ACCOUNT ACTIVATED","#a855f7")}
      ${d(`Welcome, ${e.name}! 🎤`)}
      ${p("Your artist account on The Musician's Index is live. You're part of the most competitive and creative live music platform on the internet.")}
      ${p("Here's what you can do right now:")}
      <ul style="color:rgba(255,255,255,0.6);font-size:12px;line-height:2.2;padding-left:18px;">
        <li>Go live in your own room — no waiting list</li>
        <li>Enter battles and cyphers to earn XP and credits</li>
        <li>Upload beats to the Beat Locker and earn 85%</li>
        <li>List your music as NFTs</li>
        <li>Book live shows and manage fans</li>
      </ul>
      ${c("Enter Your Hub",`${l}/artist/${String(e.slug??"profile")}`,"#a855f7")}
    `,t,"#a855f7")}),welcome_fan:(e,t)=>({subject:"You're In — The Musician's Index is Live \uD83D\uDD25",html:$(`
      ${m("FAN ACCOUNT ACTIVE","#06b6d4")}
      ${d(`Hey ${e.name}! You're officially in.`)}
      ${p("The Musician's Index is the live stage where real music happens — battles, cyphers, challenges, concerts, and more. Follow your favorite performers, tip live, and earn your own XP just by showing up.")}
      ${p("Every event is a moment. Every moment is a memory. Start collecting yours.")}
      ${c("Explore Now",`${l}/home/5`,"#06b6d4")}
    `,t,"#06b6d4")}),welcome_venue:(e,t)=>({subject:"TMI Venue Partnership Confirmed \uD83C\uDFDF️",html:$(`
      ${m("VENUE PARTNER ACTIVATED","#00FF88")}
      ${d(`Welcome, ${e.venueName}! 🏟️`)}
      ${p("Your venue is now connected to The Musician's Index. You can list events, sell tickets with zero TMI platform fees, manage seating, and track real-time attendance.")}
      ${p("Standard payment processing fees may apply. You keep everything else.")}
      ${c("Venue Dashboard",`${l}/venues/${String(e.venueSlug??"dashboard")}/dashboard`,"#00FF88")}
    `,t,"#00FF88")}),welcome_diamond:(e,t)=>({subject:"\uD83D\uDC8E Diamond VIP Activated — Welcome to the Inner Circle",html:$(`
      ${m("DIAMOND VIP","#38bdf8")}
      ${d(`${e.name}, you're in the inner circle. 💎`)}
      ${p("Diamond membership is TMI's top tier. You now have access to every premium feature on the platform — no limits, no waiting lists.")}
      <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(56,189,248,0.08);border:1px solid rgba(56,189,248,0.3);border-radius:14px;padding:0;margin:16px 0;overflow:hidden;">
        <tr><td style="padding:16px 20px;">
          <p style="margin:0 0 12px;font-size:8px;font-weight:900;letter-spacing:0.3em;color:rgba(255,255,255,0.3);text-transform:uppercase;">YOUR DIAMOND BENEFITS</p>
          ${[["\uD83C\uDFA4","Unlimited live room hours"],["⚔️","Priority battle matchmaking"],["\uD83D\uDCB0","Lowest platform fee — 5%"],["\uD83C\uDF1F","Diamond badge on all content"],["\uD83D\uDCD6","TMI Magazine digital archive access"],["\uD83C\uDFAF","Early access to all events"]].map(([e,t])=>`<p style="margin:0 0 8px;font-size:12px;color:rgba(255,255,255,0.75);">${e}&nbsp; ${t}</p>`).join("")}
        </td></tr>
      </table>
      ${c("Enter Your Diamond Hub",`${l}/profile`,"#38bdf8")}
    `,t,"#38bdf8")}),welcome_admin:(e,t)=>({subject:"\uD83D\uDD10 Admin Access Activated — TMI Control Panel",html:$(`
      ${m("ADMIN","#FF2DAA")}
      ${d(`${e.name}, you're an admin. 🔐`)}
      ${p("You now have full access to the TMI control panel, revenue analytics, user management, and platform settings.")}
      <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,45,170,0.08);border:1px solid rgba(255,45,170,0.3);border-radius:14px;padding:0;margin:16px 0;overflow:hidden;">
        <tr><td style="padding:16px 20px;">
          <p style="margin:0 0 12px;font-size:8px;font-weight:900;letter-spacing:0.3em;color:rgba(255,255,255,0.3);text-transform:uppercase;">ADMIN TOOLS</p>
          ${[["\uD83D\uDCCA","Revenue dashboard & payouts"],["\uD83D\uDC65","User management & roles"],["\uD83D\uDCE7","Email campaign blasts"],["⚙️","Platform settings & config"],["\uD83E\uDD16","Bot telemetry & health"],["\uD83D\uDD0D","Admin audit logs"]].map(([e,t])=>`<p style="margin:0 0 8px;font-size:12px;color:rgba(255,255,255,0.75);">${e}&nbsp; ${t}</p>`).join("")}
        </td></tr>
      </table>
      ${c("Go to Admin Panel",`${l}/admin`,"#FF2DAA")}
    `,t,"#FF2DAA")}),invite:(e,t)=>({subject:`${e.inviterName??"Someone you know"} invited you to The Musician's Index 🎤`,html:$(`
      ${m("PERSONAL INVITE","#FF2DAA")}
      ${d("You've been invited to the stage. \uD83C\uDFA4")}
      ${p(`<strong style="color:#fff;">${e.inviterName??"A friend"}</strong> personally invited you to The Musician's Index — the live platform where real music battles, cyphers, and concerts happen every day.`)}
      ${p("Artists earn XP, credits, and real money. Fans get front row seats. Everyone has a role.")}
      <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,45,170,0.08);border:1px solid rgba(255,45,170,0.25);border-radius:12px;margin:16px 0;overflow:hidden;">
        <tr><td style="padding:18px 20px;">
          <p style="margin:0;font-size:11px;font-weight:900;color:#FF2DAA;letter-spacing:0.12em;text-transform:uppercase;">YOUR INVITE CODE</p>
          <p style="margin:8px 0 0;font-size:24px;font-weight:900;color:#fff;letter-spacing:0.2em;font-family:monospace;">${e.inviteCode??"TMI-LIVE"}</p>
        </td></tr>
      </table>
      ${c("Accept Invite",String(e.inviteLink??`${l}/signup`),"#FF2DAA")}
      ${p('<span style="font-size:10px;color:rgba(255,255,255,0.25);">This invite expires in 7 days. New members only.</span>')}
    `,t,"#FF2DAA")}),profile_reminder:(e,t)=>({subject:`${e.name}, your stage is still waiting 🎤`,html:$(`
      ${m("WE MISS YOU","#FFD700")}
      ${d(`${e.name}, the crowd is asking about you.`)}
      ${p("It's been a while since you've been on TMI. While you were gone, the platform kept moving — new battles started, new artists went viral, new prizes were awarded.")}
      ${e.statXP?`<table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,215,0,0.07);border:1px solid rgba(255,215,0,0.22);border-radius:10px;overflow:hidden;margin:16px 0;">
        <tr><td style="padding:16px 20px;">
          <p style="margin:0;font-size:9px;letter-spacing:0.2em;color:rgba(255,255,255,0.4);text-transform:uppercase;">YOUR STANDING</p>
          <p style="margin:8px 0 0;font-size:28px;font-weight:900;color:#FFD700;">${e.statXP} XP</p>
          <p style="margin:4px 0 0;font-size:11px;color:rgba(255,255,255,0.5);">Still in ${e.statRank??"Top 1000"} &nbsp;\xb7&nbsp; Don't let it slip</p>
        </td></tr>
      </table>`:""}
      ${p("Log in today to claim your daily XP, check your earnings, and jump into a cypher.")}
      ${c("Return to TMI",`${l}/home/1`,"#FFD700")}
    `,t,"#FFD700")}),sponsor_confirmation:(e,t)=>({subject:`🤝 TMI Sponsor Account Activated — ${e.sponsorName}`,html:$(`
      ${m("SPONSOR CONFIRMED","#FFD700")}
      ${d(`Welcome, ${e.sponsorName}! Your sponsorship is live. 🤝`)}
      ${p("Your TMI sponsor account has been activated. You now have direct access to our performer network and an audience of dedicated music fans.")}
      ${g([["Package",String(e.packageName??"Standard Sponsor")],["Monthly Budget",`$${e.monthlyBudget??"500"}`],["Active Until",String(e.activeUntil??"Ongoing")],["Rep Contact",String(e.repEmail??"sponsors@themusiciansindex.com")]],"#FFD700")}
      ${c("Open Sponsor Dashboard",`${l}/sponsors/dashboard`,"#FFD700")}
      ${p('<span style="font-size:10px;color:rgba(255,255,255,0.25);">Questions? Reply to this email or reach your account rep directly.</span>')}
    `,t,"#FFD700")}),verify_email:(e,t)=>({subject:"Verify your TMI email address",html:$(`
      ${d("Verify Your Email")}
      ${p("Click the button below to verify your email address. This link expires in 24 hours.")}
      ${c("Verify Email",`${l}/auth/verify?token=${e.token}`)}
      ${p('<span style="font-size:11px;color:rgba(255,255,255,0.3);">If you didn\'t sign up, ignore this email.</span>')}
    `,t)}),password_reset:(e,t)=>({subject:"TMI Password Reset Request",html:$(`
      ${d("Reset Your Password")}
      ${p("Someone (hopefully you) requested a password reset for this TMI account.")}
      ${p("This link expires in 20 minutes and can only be used once.")}
      ${c("Reset Password",String(e.link??`${l}/auth/reset-password/${e.token}`),"#ef4444")}
      ${p('<span style="font-size:11px;color:rgba(255,255,255,0.3);">If you didn\'t request this, your account is safe — ignore this email.</span>')}
    `,t)}),security_alert:(e,t)=>({subject:"⚠️ TMI Security Alert — New Login Detected",html:$(`
      ${u("Security Alert","#ef4444")}
      ${d("New Login to Your Account")}
      ${p("A new sign-in was detected on your TMI account.")}
      ${g([["Location",String(e.location??"Unknown")],["Time",String(e.time??new Date().toUTCString())],["Device",String(e.device??"Unknown")]],"#ef4444")}
      ${p("If this wasn't you, reset your password immediately.")}
      ${c("Secure My Account",`${l}/auth/reset`,"#ef4444")}
    `,t,"#ef4444")}),new_login:(e,t)=>({subject:"New login to your TMI account",html:$(`
      ${u("Login Notice","#fbbf24")}
      ${d("New Login Detected")}
      ${g([["Location",String(e.location??"Unknown")],["Time",String(e.time??new Date().toUTCString())],["Device",String(e.device??"Unknown")]],"#fbbf24")}
      ${c("Review Activity",`${l}/settings/security`,"#fbbf24")}
    `,t,"#fbbf24")}),battle_invite:(e,t)=>({subject:`⚔️ ${e.challenger} challenged you to a battle on TMI`,html:$(`
      ${u("Battle Invite","#ef4444")}
      ${d(`${e.challenger} wants to battle you! ⚔️`)}
      ${g([["Genre",String(e.genre??"Open")],["Format",String(e.format??"Standard")],["Prize",String(e.prize??"Bragging rights")]],"#ef4444")}
      ${p("Accept within 24 hours or the challenge expires.")}
      ${c("Accept Battle",`${l}/battles/invite/${e.inviteId}`,"#ef4444")}
    `,t,"#ef4444")}),contest_win:(e,t)=>({subject:`🏆 You won the ${e.contestName} contest on TMI!`,html:$(`
      ${u("Winner!","#fbbf24")}
      ${d(`Congratulations, ${e.name}! 🏆`)}
      ${p(`You placed ${e.placement} in the <strong style="color:#fff;">${e.contestName}</strong> contest.`)}
      ${p(`Your prize: <strong style="color:#fbbf24;">${e.prizeDescription}</strong>`)}
      ${p("Prizes are delivered within 3–5 business days. Payouts over $100 require Big Ace approval.")}
      ${c("View Results",`${l}/contests/${e.contestId}`,"#fbbf24")}
    `,t,"#fbbf24")}),contest_loss:(e,t)=>({subject:`TMI Contest Update — ${e.contestName}`,html:$(`
      ${d(`The results are in, ${e.name}.`)}
      ${p(`You competed in <strong style="color:#fff;">${e.contestName}</strong>. The competition was fierce — keep working and enter again.`)}
      ${p("Your XP from this contest has been added to your profile.")}
      ${c("Enter Next Contest",`${l}/battles`,"#00FFFF")}
    `,t)}),ticket_confirmation:(e,t)=>({subject:`🎟️ Your TMI Ticket — ${e.eventName}`,html:$(`
      ${u("Ticket Confirmed","#22c55e")}
      ${d(String(e.eventName))}
      ${g([["Date",String(e.date)],["Venue",String(e.venue)],["Seat",String(e.seat)],["Confirmation",String(e.confirmationCode)]],"#22c55e")}
      ${p("Your ticket QR code is attached to this email. Present it at the door or show it on your phone.")}
      <table cellpadding="0" cellspacing="0" style="margin:0 0 16px;"><tr><td style="background:rgba(0,255,255,0.06);border:1px solid rgba(0,255,255,0.2);border-radius:8px;padding:10px 16px;font-size:11px;color:rgba(255,255,255,0.5);">Zero TMI platform fees &nbsp;&middot;&nbsp; Standard payment processing fees may apply</td></tr></table>
      ${c("View Ticket",`${l}/tickets/${e.ticketId}`,"#22c55e")}
    `,t,"#22c55e")}),nft_receipt:(e,t)=>({subject:`◈ NFT Purchased — ${e.tokenName}`,html:$(`
      ${u("NFT Confirmed","#38bdf8")}
      ${d(`You own ${e.tokenName} ◈`)}
      ${g([["Token ID",String(e.tokenId)],["Creator",String(e.creatorName)],["Edition",String(e.edition)],["Paid",`$${e.priceUsd} (${e.priceCredits} credits)`]],"#38bdf8")}
      ${c("View in Collection",`${l}/profile/nfts`,"#38bdf8")}
    `,t,"#38bdf8")}),beat_receipt:(e,t)=>({subject:`🎵 Beat Purchased — "${e.beatTitle}"`,html:$(`
      ${d(`"${e.beatTitle}" is yours 🎵`)}
      ${g([["Producer",String(e.producerName)],["BPM",String(e.bpm)],["Key",String(e.key)],["License",String(e.license)],["Paid",`$${e.priceUsd}`]],"#a855f7")}
      ${p("Your beat file is ready for download from your Beat Library.")}
      ${c("Download Beat",`${l}/profile/beats/${e.beatId}`,"#a855f7")}
    `,t,"#a855f7")}),tip_received:(e,t)=>({subject:`💰 ${e.fanName} tipped you $${e.amount}`,html:$(`
      ${d("You received a tip! \uD83D\uDCB0")}
      ${p(`<strong style="color:#fbbf24;">${e.fanName}</strong> sent you <strong style="color:#22c55e;">$${e.amount}</strong> while you were live in <strong style="color:#fff;">${e.roomName}</strong>.`)}
      ${e.message?p(`They said: <em style="color:rgba(255,255,255,0.5);">"${e.message}"</em>`):""}
      ${c("View Earnings",`${l}/artist/earnings`)}
    `,t,"#fbbf24")}),new_follower:(e,t)=>({subject:`${e.followerName} is now following you on TMI`,html:$(`
      ${d(`New follower! 👥`)}
      ${p(`<strong style="color:#fff;">${e.followerName}</strong> started following you on The Musician's Index.`)}
      ${c("View Their Profile",`${l}/profile/${e.followerSlug}`)}
    `,t)}),room_went_live:(e,t)=>({subject:`🔴 ${e.hostName} is live now on TMI`,html:$(`
      ${u("LIVE NOW","#ef4444")}
      ${d(`${e.hostName} just went live 🔴`)}
      ${p(`<strong style="color:#fff;">${e.hostName}</strong> opened a live room: <em>${e.roomName}</em>. ${e.viewerCount?`${e.viewerCount} people are already watching.`:""}`)}
      ${c("Join Live Room",`${l}/live/rooms/${e.roomSlug}`,"#ef4444")}
    `,t,"#ef4444")}),subscription_start:(e,t)=>({subject:`✅ TMI ${e.plan} Subscription Active`,html:$(`
      ${u(String(e.plan),"diamond"===e.plan?"#38bdf8":"gold"===e.plan?"#fbbf24":"#94a3b8")}
      ${d(`Your ${e.plan} plan is live! ✅`)}
      ${g([["Plan",String(e.plan)],["Monthly Billing",`$${e.priceMonthly}`],["Next Renewal",String(e.renewalDate)]])}
      ${p("You now have access to all features included with your tier.")}
      ${c("Explore Your Plan",`${l}/settings/billing`)}
    `,t)}),subscription_renew:(e,t)=>({subject:`✅ TMI Subscription Renewed — ${e.plan}`,html:$(`
      ${d(`Subscription renewed ✅`)}
      ${p(`Your <strong style="color:#fff;">${e.plan}</strong> plan has been renewed. Next billing: <strong style="color:#00FFFF;">${e.nextRenewalDate}</strong>.`)}
      ${c("Manage Subscription",`${l}/settings/billing`)}
    `,t)}),subscription_cancel:(e,t)=>({subject:"TMI Subscription Cancelled",html:$(`
      ${d("Subscription Cancelled")}
      ${p(`Your TMI subscription has been cancelled. You'll retain access until <strong style="color:#fff;">${e.accessUntil}</strong>.`)}
      ${p("We're sorry to see you go. Come back anytime — your account stays active.")}
      ${c("Reactivate",`${l}/settings/billing`)}
    `,t)}),subscription_upgrade:(e,t)=>({subject:`🚀 Upgraded to TMI ${e.newPlan}`,html:$(`
      ${d(`You upgraded to ${e.newPlan} 🚀`)}
      ${p(`Your account has been upgraded from <strong style="color:#fff;">${e.oldPlan}</strong> to <strong style="color:#00FFFF;">${e.newPlan}</strong>. All new features are active immediately.`)}
      ${c("See What's New",`${l}/settings/billing`)}
    `,t,"#00FFFF")}),weekly_digest:(e,t)=>({subject:`📊 Your TMI Weekly — ${e.weekEnding}`,html:$(`
      ${m("WEEKLY DIGEST","#00FFFF")}
      ${d("Your Week on TMI")}
      <table width="100%" cellpadding="4" cellspacing="0" style="margin-bottom:16px;">
        ${e.stats.map(e=>`
          <tr><td style="background:rgba(255,255,255,0.03);border-radius:8px;padding:14px 16px;text-align:center;border:1px solid rgba(255,255,255,0.06);">
            <p style="margin:0;font-size:22px;font-weight:900;color:${e.color};">${e.value}</p>
            <p style="margin:4px 0 0;font-size:8px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:0.15em;">${e.label}</p>
          </td></tr>
        `).join("")}
      </table>
      ${c("Full Analytics",`${l}/analytics`)}
    `,t)}),magazine_drop:(e,t)=>({subject:`📖 TMI Magazine — ${e.issueName} Is Live`,html:$(`
      ${u("New Issue","#ec4899")}
      ${d(String(e.issueName))}
      ${p(`This month: ${e.teaser}`)}
      ${p(`${e.articleCount} articles &nbsp;&middot;&nbsp; ${e.featuredArtist} on the cover`)}
      ${c("Read Now",`${l}/magazine`,"#ec4899")}
    `,t,"#ec4899")}),payout_queued:(e,t)=>({subject:"\uD83D\uDCB8 Payout Queued — Awaiting Big Ace Approval",html:$(`
      ${d("Payout Request Queued \uD83D\uDCB8")}
      ${g([["Amount",`$${e.amount}`],["Reason",String(e.reason)],["Status","Awaiting approval"]],"#22c55e")}
      ${p("Per platform policy, all cash payouts over $10 require approval from Big Ace before processing. Typical approval time: 24–72 hours.")}
    `,t,"#22c55e")}),payout_approved:(e,t)=>({subject:"✅ Payout Approved — Sending Now",html:$(`
      ${u("Payout Approved","#22c55e")}
      ${d("Your payout is on the way! ✅")}
      ${g([["Amount",`$${e.amount}`],["Method",String(e.method??"Bank transfer")],["ETA",String(e.eta??"3–5 business days")]],"#22c55e")}
      ${c("View Earnings",`${l}/artist/earnings`,"#22c55e")}
    `,t,"#22c55e")}),streak_warning:(e,t)=>({subject:"⚠️ Your TMI streak ends today",html:$(`
      ${m("STREAK ALERT","#FF2DAA")}
      ${d("Don't break the chain \uD83D\uDD25","#FF2DAA")}
      ${p(`You're on a <strong style="color:#FF2DAA;">${e.currentStreak}-day streak</strong> — but you haven't checked in today.`)}
      ${p("Log in, listen to a track, or submit something. That's all it takes to keep it alive.")}
      ${g([["Current Streak",`🔥 ${e.currentStreak} days`],["XP Multiplier",`${e.multiplier}\xd7`],["Longest Streak",`${e.longestStreak} days`]],"#FF2DAA")}
      ${c("Keep My Streak",`${l}/home/1`,"#FF2DAA")}
      ${p("Tomorrow the multiplier resets. Today it stays yours.")}
    `,t,"#FF2DAA")})},b=new Set(["verify_email","password_reset","security_alert","new_login","ticket_confirmation","nft_receipt","beat_receipt","tip_received","subscription_start","subscription_renew","subscription_cancel","subscription_upgrade","payout_queued","payout_approved","contest_win","contest_loss","battle_invite","welcome_diamond","welcome_admin","sponsor_confirmation","welcome_artist","welcome_fan","welcome_venue","streak_warning","invite"]);async function h({to:e,type:t,data:n}){let o=f[t];if(!o)return{success:!1,error:`Unknown email type: ${t}`};if(function(e){let t=e.split("@")[1]?.toLowerCase();return!!t&&s.has(t)}(e))return{success:!1,error:"Disposable email address blocked"};let l=b.has(t)?"transactional":"weekly_digest"===t||"magazine_drop"===t?"newsletter":"marketing";if("transactional"!==l&&(0,a.Bu)(e,l))return{success:!1,error:`Recipient unsubscribed from ${l}`};let c=function(e){let t=Date.now();if(t-i.windowStart>6e4&&(i={count:0,windowStart:t}),i.count>=200)return{allowed:!1,reason:"global_rate_limit",retryAfterMs:6e4-(t-i.windowStart)};let n=r.get(e);return((!n||t-n.windowStart>6e4)&&(n={count:0,windowStart:t}),n.count>=5)?{allowed:!1,reason:"recipient_rate_limit",retryAfterMs:6e4-(t-n.windowStart)}:(r.set(e,{...n,count:n.count+1}),i.count++,{allowed:!0})}(e);if(!c.allowed)return{success:!1,error:`Rate limited: ${c.reason}. Retry in ${Math.ceil((c.retryAfterMs??6e4)/1e3)}s`};let{subject:d,html:p}=o(n,e),u=process.env.RESEND_API_KEY;if(!u)return{success:!1,error:"RESEND_API_KEY not configured"};try{let t=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${u}`,"Content-Type":"application/json"},body:JSON.stringify({from:process.env.EMAIL_FROM??"The Musician's Index <noreply@themusiciansindex.com>",to:e,subject:d,html:p})}),n=await t.json();if(!t.ok)return{success:!1,error:n.message??"Resend error"};return{success:!0,messageId:n.id}}catch(e){return{success:!1,error:String(e)}}}},665641:(e,t,n)=>{n.d(t,{Bu:()=>a,Fg:()=>s,O5:()=>i,r1:()=>r});let o=new Map;function r(e,t="all"){let n=e.toLowerCase().trim(),r=o.get(n);if(r)"all"===t?(r.categories.add("marketing"),r.categories.add("newsletter"),r.categories.add("transactional"),r.categories.add("all")):r.categories.add(t);else{let e=new Set("all"===t?["marketing","newsletter","transactional","all"]:[t]);o.set(n,{email:n,categories:e,unsubscribedAt:Date.now()})}}function i(e,t="all"){let n=e.toLowerCase().trim(),r=o.get(n);r&&("all"===t?o.delete(n):(r.categories.delete(t),0===r.categories.size&&o.delete(n)))}function a(e,t="marketing"){let n=e.toLowerCase().trim(),r=o.get(n);return!!r&&(r.categories.has("all")||r.categories.has(t))}function s(e,t){return Buffer.from(`${t}:${process.env.TICKET_SECRET_SALT??"tmi-salt"}:unsub`).toString("base64url").slice(0,32)===e}}};