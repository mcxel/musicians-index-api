import BillingEmailEngine from '@/lib/email/BillingEmailEngine';
import type { QueuedEmailJob } from '@/lib/email/EmailQueueEngine';

export class InvoiceEmailEngine {
  static sendInvoiceReceipt(input: {
    userId: string;
    to: string;
    invoiceId: string;
    amount: string;
  }): QueuedEmailJob {
    return BillingEmailEngine.sendReceipt(input);
  }
}

export default InvoiceEmailEngine;
