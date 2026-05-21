// apps/api/src/pipelines/pipeline-registry.ts
// Every automated pipeline with its steps.

export type PipelineId =
  | 'article-publish' | 'story-rotation' | 'media-upload'
  | 'video-encode' | 'image-optimize' | 'clip-generate'
  | 'clip-share-export' | 'stream-live' | 'show-replay'
  | 'sponsor-campaign' | 'ad-placement' | 'ad-approval'
  | 'notification-delivery' | 'email-send'
  | 'analytics-ingest' | 'search-index'
  | 'earnings-calculate' | 'payout-process'
  | 'fraud-score' | 'backup' | 'deploy';

export interface PipelineConfig {
  id: PipelineId;
  label: string;
  trigger: string;
  steps: string[];
  onFailure: 'retry' | 'alert_admin' | 'rollback' | 'skip';
  maxRetries: number;
  timeoutSeconds: number;
}

export const PIPELINE_REGISTRY: PipelineConfig[] = [
  {
    id: 'article-publish',
    label: 'Article Publish Pipeline',
    trigger: 'article.approved',
    steps: ['validate_content', 'assign_ad_slots', 'set_author_station_link', 'index_search', 'notify_followers', 'add_to_magazine_feed'],
    onFailure: 'alert_admin', maxRetries: 2, timeoutSeconds: 30,
  },
  {
    id: 'story-rotation',
    label: 'Featured Story Rotation Pipeline',
    trigger: 'cron:0 * * * *',
    steps: ['fetch_published_articles', 'score_by_freshness_engagement', 'select_featured', 'update_homepage_belt', 'update_magazine_front'],
    onFailure: 'skip', maxRetries: 1, timeoutSeconds: 10,
  },
  {
    id: 'media-upload',
    label: 'Media Upload Pipeline',
    trigger: 'media.uploaded',
    steps: ['validate_format', 'scan_content', 'resize_images_or_transcode', 'generate_thumbnail', 'push_to_r2_cdn', 'update_media_record'],
    onFailure: 'alert_admin', maxRetries: 3, timeoutSeconds: 120,
  },
  {
    id: 'clip-generate',
    label: 'Clip Generation Pipeline',
    trigger: 'show.ended OR user.clip_request',
    steps: ['extract_segment', 'encode_clip', 'generate_thumbnail', 'add_metadata', 'push_to_cdn', 'add_to_clip_library', 'enable_share_links'],
    onFailure: 'retry', maxRetries: 2, timeoutSeconds: 60,
  },
  {
    id: 'clip-share-export',
    label: 'Clip Share + Export Pipeline',
    trigger: 'clip.share_requested',
    steps: ['generate_share_url', 'generate_download_url_if_allowed', 'create_embed_code', 'track_share_event'],
    onFailure: 'skip', maxRetries: 1, timeoutSeconds: 10,
  },
  {
    id: 'sponsor-campaign',
    label: 'Sponsor Campaign Pipeline',
    trigger: 'campaign.approved',
    steps: ['reserve_slots', 'validate_creative', 'schedule_placements', 'activate_overlays', 'start_impression_tracking'],
    onFailure: 'alert_admin', maxRetries: 2, timeoutSeconds: 30,
  },
  {
    id: 'earnings-calculate',
    label: 'Artist Earnings Calculation Pipeline',
    trigger: 'cron:0 * * * * (hourly)',
    steps: ['aggregate_tips', 'aggregate_ad_revenue_share', 'aggregate_contest_prizes', 'apply_platform_fee', 'update_wallet', 'update_earnings_panel'],
    onFailure: 'alert_admin', maxRetries: 3, timeoutSeconds: 60,
  },
  {
    id: 'payout-process',
    label: 'Payout Processing Pipeline',
    trigger: 'Big Ace approves distribution',
    steps: ['verify_balance', 'calculate_splits', 'initiate_paypal_transfer', 'record_ledger_entry', 'send_receipt', 'update_payout_history'],
    onFailure: 'alert_admin', maxRetries: 1, timeoutSeconds: 120,
  },
  {
    id: 'fraud-score',
    label: 'Fraud Scoring Pipeline',
    trigger: 'payment.initiated',
    steps: ['check_velocity', 'check_device_fingerprint', 'check_account_age', 'score_risk', 'approve_or_flag'],
    onFailure: 'alert_admin', maxRetries: 0, timeoutSeconds: 5,
  },
];
