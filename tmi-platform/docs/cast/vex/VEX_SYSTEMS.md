# VEX_COSTUME_ENGINE.md
## VEX-9 Wardrobe and Outfit Rotation System

---

## COSTUME RULES

1. VEX NEVER wears the same outfit back-to-back
2. VEX NEVER repeats an outfit within the same show session
3. All outfits pull from store inventory — every VEX outfit is shoppable
4. Outfit selection uses weighted randomization (event-type influences category)
5. Sponsor outfit drops get priority on sponsored events
6. Personality shifts with each outfit

---

## COSTUME CATEGORIES

| Category | Style | Personality Mode |
|---|---|---|
| Streetwear | Chains, hoodie, sneakers | Swagger, cool |
| Authority | Police/security uniform | Strict, fast, efficient |
| Performer Glam | Stage fit, glitter | Flashy, dramatic |
| Magician | Top hat, cape | Slow reveals, mysterious |
| Royalty | Crown, robe | Regal, elegant |
| Bunny Remix | Bunny-suit comedy version | Playful, goofy |
| Festival | Neon rave fit | Bouncy, chaotic |
| Sports Ref | Referee/coach | Authoritative, reactive |
| Detective | Long coat, hat | Investigative, serious |
| Sponsor Event | Branded sponsor fit | Promo energy |
| Holiday | Season-appropriate | Themed reaction |

---

## PERSONALITY SHIFT SYSTEM

Outfit changes VEX's movement + LED face style:

```
streetwear → swagger walk, cool head nod, sunglasses overlay
authority → quick march, sharp turns, whistle sound
magician → slow glide, dramatic reveal pauses
royalty → slow ceremonial walk, royal procession pace
bunny → hop-step, playful, high pitch sounds
performer → stage strut, arm-out flair
```

---

## STORE INTEGRATION

Every VEX appearance generates an outfit notification:
```
"🔥 VEX is wearing [ITEM] tonight — Shop the look →"
```

Items are clickable and link directly to the store.

---

# VEX_APPROACH_AUDIO_SYSTEM.md
## Proximity Warning Sound System

---

## CORE RULE
Sound ramps with proximity — never instant full blast.

## DISTANCE ZONES

| Zone | Distance | Audio |
|---|---|---|
| Warning Zone (far) | >8 units | Faint trumpet tease, light marching rhythm |
| Approach Zone (mid) | 4–8 units | Louder brass hit, percussion kick, LED face activates |
| Escort Zone (close) | 1–4 units | Full warning sting — trumpet + percussion together |
| Contact | <1 unit | Short payoff sting + costume-specific audio |

## VOLUME CURVE
Volume scales proportionally to proximity:
```
distance 10 = 15% volume
distance 7  = 35% volume
distance 4  = 60% volume
distance 2  = 85% volume
contact     = 100% + crowd reaction
```

## COSTUME-SPECIFIC AUDIO LAYER

| Outfit | Sound Character |
|---|---|
| Streetwear | Swagger bass cue under brass |
| Authority | Alert whistle over brass |
| Magician | Sparkle reveal sting |
| Royalty | Fanfare brass |
| Bunny/Clown | Playful hop sound over brass |
| Performer Glam | Stage stinger |

## MUTE/REDUCE MODE
- Accessibility mode: visual only (LED face + proximity indicator UI)
- Quiet venue mode: volume capped at 50%
- User-controlled mute always available

---

# VEX_ESCORT_SEQUENCE.md
## Step-by-Step Stage Removal Choreography

---

## TRIGGER
Nova Blaze signals, or elimination mechanic fires.

## SEQUENCE

```
1. WARNING PHASE
   - VEX appears at stage wing
   - Faint audio begins
   - LED face: neutral/mischievous
   - Slow theatrical approach begins

2. APPROACH PHASE
   - Audio increases
   - VEX pacing speeds slightly
   - Crowd begins reacting
   - Contestant receives visual cue

3. ESCORT PHASE
   - VEX reaches contestant
   - Costume-appropriate escort animation plays
   - Audio hits full sting
   - Contestant reaction animation triggers

4. REMOVAL PHASE
   - VEX guides contestant off stage
   - Walk-off choreography plays
   - Crowd reaction peaks
   - Optional: VEX wave or bow to crowd

5. EXIT PHASE
   - VEX exits via designated wing
   - Applause sting plays
   - LED face: satisfied/happy
   - Reset for next sequence
```

## CONTESTANT REACTIONS
VEX can receive one of these contestant animations:
- Playful surrender
- Funny resistance (brief, comedic)
- Proud walk-off
- Dramatic exit
- Surprised freeze

---

# VEX_COSTUME_AUDIO_MAP.md
## Full Audio Map Per Costume Category

---

| Costume | Entry Sound | Approach Sound | Contact Sound | Exit Sound |
|---|---|---|---|---|
| Streetwear | Bass cue | Swagger beat | Removal groove | Bass fade |
| Authority | Alert tone | Crisp march | Whistle payoff | March exit |
| Performer Glam | Stage stinger | Build-up | Showstopper hit | Mic drop sting |
| Magician | Mysterious swell | Suspense beat | Sparkle reveal | Magic vanish |
| Royalty | Fanfare brass | Royal march | Crown sting | Procession exit |
| Bunny Remix | Hop tune | Playful brass | Boing hit | Hop exit |
| Festival | Rave drop tease | Build | Full drop | Beat fade |
| Detective | Noir piano | Suspense | Case closed | Footstep exit |
| Sports Ref | Referee whistle | Beat | Elimination sting | Buzzer |

---

*VEX Complete Systems v1.0 — BerntoutGlobal XXL*
