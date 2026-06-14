"use server";

import { revalidatePath } from 'next/cache';
import { processUploadRoute, UploadCategory } from '@/lib/storage/UploadPipelineEngine';

/**
 * Server Actions for TMI Upload Pipeline
 * Directly connects Claude's visual UI forms to the backend Vault architecture.
 */

export async function handleMediaUpload(formData: FormData) {
  const file = formData.get('file') as File;
  const category = formData.get('category') as UploadCategory;
  const userId = formData.get('userId') as string;

  if (!file || !category || !userId) {
    return { error: 'Missing required upload parameters.' };
  }

  try {
    // 1. Route the file through the Pipeline Engine
    const routeData = await processUploadRoute(file.name, category, userId);

    // 2. WIRING: In a fully connected environment, this is where you execute:
    // await prisma[routeData.dbModel].create({ data: { url: routeData.storagePath, userId } })
    // await s3.upload(file, routeData.storagePath)

    console.log(`[TMI Server Action] File ${file.name} successfully routed to ${routeData.dbModel}`);
    
    // 3. Auto-refresh the UI to show the new content instantly
    if (category === 'MEMORY_WALL' || category === 'PROFILE_IMAGE') {
      revalidatePath(`/profile/${userId}`);
    } else if (category === 'BEAT_UPLOAD') {
      revalidatePath(`/vault/producer/${userId}`);
    } else if (category === 'TRACK_UPLOAD') {
      revalidatePath(`/arena/challenges`);
    }

    return { 
      success: true, 
      url: routeData.storagePath,
      eligibility: routeData.eligibility 
    };

  } catch (error: any) {
    console.error('[TMI Server Action] Upload Pipeline Error:', error);
    return { error: error.message || 'Upload failed to route.' };
  }
}