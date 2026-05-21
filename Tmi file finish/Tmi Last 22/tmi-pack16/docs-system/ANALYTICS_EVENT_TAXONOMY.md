# ANALYTICS_EVENT_TAXONOMY.md
## Every Event — Shared Naming Convention [object].[action]
Homepage: homepage.view{page,user_tier} | card.click{card_id,destination} | page.flip{from,to}
Crown: crown.view{artist_id,week} | crown.transfer{from,to,week} | ranking.update{artist_id,old,new}
Rooms: room.join{room_id,type,venue_id,user_tier} | room.leave{room_id,watch_duration}
Preview: preview.open{room_id,owner_id,source_type} | preview.turn.claim | preview.turn.release
Economy: tip.sent{amount,artist_id} | points.earned{amount,action} | subscription.start{tier}
  | subscription.upgrade{from_tier,to_tier} | spin.result{reward_type,reward_value}
Social: user.follow{target_id} | invite.sent{type,recipient} | collab.request.sent{target_id}
Search: search.query{query,filter,results_count} | random.room.join{room_id}
Bots: bot.run{bot_id,trigger,duration_ms,result} | bot.fail{bot_id,error,fallback_used}
Errors: route.404{path} | api.error{endpoint,status_code} | room.watchdog.alert{room_id,state}
Copilot wires: analytics service in apps/api/src/services/analytics.service.ts
