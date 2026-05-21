import pathlib

schema_path = pathlib.Path(r"c:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform\packages\db\prisma\schema.prisma")

new_models = """

// ==============================================================================
// DIRECT MESSAGING
// ==============================================================================

model Conversation {
  id           String          @id @default(cuid())
  participant1 String
  participant2 String
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt
  messages     DirectMessage[]

  @@unique([participant1, participant2])
  @@index([participant1])
  @@index([participant2])
  @@map("conversations")
}

model DirectMessage {
  id             String       @id @default(cuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  senderId       String
  content        String       @db.Text
  isRead         Boolean      @default(false)
  readAt         DateTime?
  deletedAt      DateTime?
  createdAt      DateTime     @default(now())

  @@index([conversationId, createdAt])
  @@index([senderId])
  @@map("direct_messages")
}

// ==============================================================================
// BATTLE VOTES
// ==============================================================================

model BattleVote {
  id        String   @id @default(cuid())
  battleId  String
  battle    Battle   @relation(fields: [battleId], references: [id], onDelete: Cascade)
  voterId   String
  votedFor  Int
  createdAt DateTime @default(now())

  @@unique([battleId, voterId])
  @@index([battleId])
  @@map("battle_votes")
}
"""

existing = schema_path.read_text(encoding="utf-8")

# Guard: don't append if models already exist
if "model Conversation {" in existing:
    print("Conversation already exists — skipping.")
elif "model BattleVote {" in existing:
    print("BattleVote already exists — skipping.")
else:
    schema_path.write_text(existing + new_models, encoding="utf-8")
    lines = len(schema_path.read_text(encoding="utf-8").splitlines())
    print(f"SUCCESS — schema now has {lines} lines")
    print("Added: Conversation, DirectMessage, BattleVote")
