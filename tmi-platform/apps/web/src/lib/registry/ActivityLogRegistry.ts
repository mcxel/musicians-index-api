export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

class ActivityLogRegistry {
  private logs: ActivityLog[] = [];

  log(activity: ActivityLog) {
    this.logs.push(activity);
  }

  getLogsByUser(userId: string) {
    return this.logs.filter(log => log.userId === userId);
  }

  getAllLogs() {
    return this.logs;
  }
}

export const activityLogRegistry = new ActivityLogRegistry();