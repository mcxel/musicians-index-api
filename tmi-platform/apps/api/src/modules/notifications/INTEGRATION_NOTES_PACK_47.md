# Pack 47 Integration Notes: Advanced Notifications System

## Overview

The Notifications module has been significantly enhanced to support multi-channel, template-driven, and asynchronous notifications. The system is now composed of two parts:

1.  **Sending Pipeline (New):** An internal-facing system for other services to trigger notifications.
2.  **Client API (Existing):** The existing `NotificationsController` that allows clients to fetch in-app notifications and manage preferences.

## How to Send a Notification

To trigger a notification from any other service within the NestJS API, inject the `NotificationsService` and call the `triggerNotification` method.

**Example from a hypothetical `RewardsService`:**

```typescript
import { Injectable } from '@nestjs/common';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class RewardsService {
  constructor(private readonly notificationsService: NotificationsService) {}

  async grantReward(userId: string, rewardName: string) {
    // ... logic to grant reward ...

    // Trigger a notification
    await this.notificationsService.triggerNotification({
      userId: userId,
      type: 'REWARD_UNLOCKED', // This must match a 'type' in the NotificationTemplate table
      data: {
        rewardName: rewardName,
        date: new Date().toLocaleDateString(),
      },
    });

    // ...
  }
}
```

## System Components

### 1. Prisma Schema

The following models have been added to `packages/db/prisma/schema.prisma`:

-   `NotificationTemplate`: Stores the content for each notification `type` and `channel`.
-   `OutgoingNotification`: A log of every notification job processed by the system. This is the source of truth for all sent notifications and their status.
-   `InAppNotification`: A dedicated table for user-facing in-app notifications.

**Legacy Models:**
The old `Notification` model is now considered legacy. The `NotificationsController` still reads from it for backwards compatibility, but all new in-app notifications are created in the `InAppNotification` table. A future migration should be planned to move data and update the controller.

### 2. Queueing System

-   The system uses `BullMQ` with a queue named `'notifications'`.
-   `NotificationsProducerService` is used to add jobs to the queue.
-   `NotificationsProcessor` is the worker that processes the jobs. It contains the core logic for checking preferences, rendering templates, and calling the appropriate channel service.

### 3. Templates

-   Before a notification can be triggered, a corresponding `NotificationTemplate` must exist in the database.
-   The `type` field in `triggerNotification` must match a `type` in the `NotificationTemplate` table.
-   Templates support simple variable substitution using `{{variableName}}`. The keys in the `data` payload of `triggerNotification` must match the variable names in the template.

**Example Template SQL:**

```sql
INSERT INTO "notification_templates" ("type", "description", "templateInAppTitle", "templateInAppBody", "templateEmailSubject", "templateEmailBody")
VALUES (
  'REWARD_UNLOCKED',
  'Sent when a user receives a new reward.',
  'You unlocked a new reward!',
  'Congratulations! You have received the {{rewardName}} reward.',
  'You''ve Unlocked a New Reward: {{rewardName}}',
  '<h1>Congratulations!</h1><p>You have received the <strong>{{rewardName}}</strong> reward. View it in your inventory now!</p>'
);

```

### 4. Configuration

-   The queue relies on a Redis connection. Ensure the environment variables for Redis (`REDIS_HOST`, `REDIS_PORT`) are correctly configured for the API application.

## Next Steps & Future Improvements

-   **Update Client:** The web client should be updated to fetch notifications from the new `InAppNotification` table via the controller (this will require a controller update).
-   **Implement SMS/Push:** The `SmsService` and `PushService` are currently placeholders. To make them functional, they must be integrated with a real provider (e.g., Twilio for SMS, FCM for Push). The `User` model will also need to be updated to store phone numbers and push subscription tokens.
-   **Admin UI:** An admin interface should be created to manage `NotificationTemplate`s.
-   **Websockets:** For real-time in-app notifications, a websocket gateway should be implemented to push a message to the client when a new `InAppNotification` is created, prompting a re-fetch.
