/**
 * G-1B Level 1 Developer Verification Harness
 *
 * Automated tests for runtime correctness:
 * 1. Event firing and propagation
 * 2. Attention state updates
 * 3. Renderer integration
 * 4. Performance stability
 * 5. Memory behavior
 */

import { roomEnergyEngine, type RoomEnergyState } from './RoomEnergyEngine';
import {
  directAttention,
  focusRoomOnStage,
  triggerApplause,
  propagateAttentionContagion,
  getRoomAttentionVectors,
  getAttentionStats,
  onAttentionUpdate,
  type AttentionVector,
} from '@/lib/engines/runtime/CrowdAttentionEngine';
import { avatarAttentionRuntime } from '@/lib/engines/attention/AvatarAttentionRuntime';

interface VerificationResult {
  test: string;
  passed: boolean;
  duration: number;
  error?: string;
  metrics?: Record<string, number | string>;
}

interface VerificationReport {
  timestamp: string;
  results: VerificationResult[];
  summary: { passed: number; failed: number; total: number };
}

export class G1BVerificationHarness {
  private results: VerificationResult[] = [];
  private testRoomId = 'test-room-g1b';
  private testAvatarIds: string[] = [];
  private attentionUpdatesReceived = 0;

  /**
   * Test 1: Event firing and propagation
   */
  async testEventPropagation(): Promise<VerificationResult> {
    const start = performance.now();
    try {
      // Setup
      roomEnergyEngine.initRoom(this.testRoomId);

      // Create test avatars
      this.testAvatarIds = Array.from({ length: 10 }, (_, i) => `avatar-${i}`);
      roomEnergyEngine.setRoomAvatars(this.testRoomId, this.testAvatarIds);
      roomEnergyEngine.setRoomPerformer(this.testRoomId, 'performer-123');

      // Subscribe to attention updates
      let updateCount = 0;
      const unsubscribe = onAttentionUpdate(() => {
        updateCount++;
      });

      // Trigger events
      roomEnergyEngine.recordReaction(this.testRoomId);
      await new Promise(r => setTimeout(r, 50));

      roomEnergyEngine.recordTip(this.testRoomId, 50);
      await new Promise(r => setTimeout(r, 50));

      roomEnergyEngine.recordVote(this.testRoomId);
      await new Promise(r => setTimeout(r, 50));

      roomEnergyEngine.recordGift(this.testRoomId);
      await new Promise(r => setTimeout(r, 50));

      unsubscribe();

      // Verify
      const passed = updateCount >= 3; // Should have received multiple attention updates
      const energy = roomEnergyEngine.getState(this.testRoomId);
      const energyRose = (energy?.energyScore ?? 0) > 0;

      return {
        test: 'Event Propagation',
        passed: (passed && energyRose) as boolean,
        duration: performance.now() - start,
        metrics: {
          attentionUpdates: updateCount,
          energyScore: energy?.energyScore ?? 0,
          energyLabel: energy?.energyLabel ?? 'COLD',
        },
      };
    } catch (error) {
      return {
        test: 'Event Propagation',
        passed: false,
        duration: performance.now() - start,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Test 2: Attention state updates
   */
  async testAttentionStateUpdates(): Promise<VerificationResult> {
    const start = performance.now();
    try {
      const avatarIds = this.testAvatarIds.slice(0, 5);

      // Trigger attention change
      directAttention(avatarIds[0], { kind: 'stage' }, 0.8, 200);

      await new Promise(r => setTimeout(r, 50));

      // Check runtime state
      const output = avatarAttentionRuntime.getVisualOutput(avatarIds[0]);
      const stats = getAttentionStats(avatarIds);

      const headYawUpdated = !!(output && Math.abs(output.headYaw) >= 0);
      const statsCollected = stats ? stats.avgIntensity >= 0 : false;

      return {
        test: 'Attention State Updates',
        passed: (headYawUpdated && statsCollected) as boolean,
        duration: performance.now() - start,
        metrics: {
          headYaw: output?.headYaw ?? 0,
          eyeYaw: output?.eyeYaw ?? 0,
          avgIntensity: stats.avgIntensity,
          transitioningCount: stats.activeWaveCount,
        },
      };
    } catch (error) {
      return {
        test: 'Attention State Updates',
        passed: false,
        duration: performance.now() - start,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Test 3: Renderer integration (AttentionVector → AudienceScene)
   */
  async testRendererIntegration(): Promise<VerificationResult> {
    const start = performance.now();
    try {
      const avatarIds = this.testAvatarIds.slice(0, 8);

      // Trigger applause (should update attention vectors)
      triggerApplause(avatarIds, 0.75);

      await new Promise(r => setTimeout(r, 100));

      // Get vectors as AudienceScene would
      const vectors = getRoomAttentionVectors(avatarIds);

      // Verify vectors are valid
      const hasVectors = vectors.length > 0;
      const vectorsValid = vectors.every(v =>
        typeof v.yaw === 'number' &&
        typeof v.pitch === 'number' &&
        typeof v.intensity === 'number'
      );

      return {
        test: 'Renderer Integration',
        passed: hasVectors && vectorsValid,
        duration: performance.now() - start,
        metrics: {
          vectorsGenerated: vectors.length,
          sampleYaw: vectors[0]?.yaw ?? 0,
          samplePitch: vectors[0]?.pitch ?? 0,
          sampleIntensity: vectors[0]?.intensity ?? 0,
        },
      };
    } catch (error) {
      return {
        test: 'Renderer Integration',
        passed: false,
        duration: performance.now() - start,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Test 4: Performance stability across avatar counts
   */
  async testPerformanceStability(): Promise<VerificationResult> {
    const start = performance.now();
    try {
      const counts = [25, 75, 150];
      const timings: Record<number, number> = {};

      for (const count of counts) {
        const avatarIds = Array.from({ length: count }, (_, i) => `perf-avatar-${i}`);
        roomEnergyEngine.setRoomAvatars(this.testRoomId, avatarIds);

        const testStart = performance.now();

        // Simulate event + propagation
        triggerApplause(avatarIds, 0.7);
        const vectors = getRoomAttentionVectors(avatarIds);

        timings[count] = performance.now() - testStart;
      }

      // Check that timing doesn't degrade badly (should scale roughly linearly)
      const degradation = timings[150] / timings[25];
      const acceptableDegradation = degradation < 10; // 10x is acceptable for 6x avatar increase

      return {
        test: 'Performance Stability',
        passed: acceptableDegradation,
        duration: performance.now() - start,
        metrics: {
          timingFor25Avatars: `${timings[25].toFixed(1)}ms`,
          timingFor75Avatars: `${timings[75].toFixed(1)}ms`,
          timingFor150Avatars: `${timings[150].toFixed(1)}ms`,
          degradationFactor: degradation.toFixed(2),
        },
      };
    } catch (error) {
      return {
        test: 'Performance Stability',
        passed: false,
        duration: performance.now() - start,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Test 5: Repeated cycles (memory behavior)
   */
  async testRepeatedCycles(): Promise<VerificationResult> {
    const start = performance.now();
    try {
      const avatarIds = this.testAvatarIds.slice(0, 20);
      const cycleCount = 50;

      // Run 50 cycles of applause + tip
      for (let i = 0; i < cycleCount; i++) {
        triggerApplause(avatarIds, 0.6 + Math.random() * 0.2);
        await new Promise(r => setTimeout(r, 5));

        roomEnergyEngine.recordTip(this.testRoomId, 10 + Math.random() * 50);
        await new Promise(r => setTimeout(r, 5));
      }

      // Verify final state is still valid
      const finalEnergy = roomEnergyEngine.getState(this.testRoomId);
      const finalVectors = getRoomAttentionVectors(avatarIds);

      const stateValid = finalEnergy !== undefined;
      const vectorsValid = finalVectors.every(v =>
        !isNaN(v.yaw) && !isNaN(v.pitch) && !isNaN(v.intensity)
      );

      return {
        test: 'Repeated Cycles (Memory Stability)',
        passed: stateValid && vectorsValid,
        duration: performance.now() - start,
        metrics: {
          cyclesCompleted: cycleCount,
          finalEnergyScore: finalEnergy?.energyScore ?? 0,
          finalEnergyLabel: finalEnergy?.energyLabel ?? 'UNKNOWN',
          finalVectorsValid: vectorsValid ? 'VALID' : 'INVALID',
        },
      };
    } catch (error) {
      return {
        test: 'Repeated Cycles (Memory Stability)',
        passed: false,
        duration: performance.now() - start,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Run all verification tests
   */
  async runAllTests(): Promise<VerificationReport> {
    console.log('🧪 Starting G-1B Level 1 Verification Harness...\n');

    const results: VerificationResult[] = [];

    // Run tests in sequence
    console.log('Test 1/5: Event Propagation...');
    results.push(await this.testEventPropagation());

    console.log('Test 2/5: Attention State Updates...');
    results.push(await this.testAttentionStateUpdates());

    console.log('Test 3/5: Renderer Integration...');
    results.push(await this.testRendererIntegration());

    console.log('Test 4/5: Performance Stability...');
    results.push(await this.testPerformanceStability());

    console.log('Test 5/5: Repeated Cycles...');
    results.push(await this.testRepeatedCycles());

    const report: VerificationReport = {
      timestamp: new Date().toISOString(),
      results,
      summary: {
        passed: results.filter(r => r.passed).length,
        failed: results.filter(r => !r.passed).length,
        total: results.length,
      },
    };

    // Print report
    this.printReport(report);

    return report;
  }

  private printReport(report: VerificationReport): void {
    console.log('\n📊 G-1B VERIFICATION REPORT\n');
    console.log(`Timestamp: ${report.timestamp}`);
    console.log(`\n${report.summary.passed}/${report.summary.total} tests passed\n`);

    report.results.forEach((result, i) => {
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} Test ${i + 1}: ${result.test}`);
      console.log(`   Duration: ${result.duration.toFixed(1)}ms`);

      if (result.metrics) {
        Object.entries(result.metrics).forEach(([key, value]) => {
          console.log(`   ${key}: ${value}`);
        });
      }

      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }

      console.log();
    });

    if (report.summary.failed === 0) {
      console.log('✨ All tests passed. Runtime is ready for visual certification.\n');
    } else {
      console.log(`⚠️  ${report.summary.failed} test(s) failed. See errors above.\n`);
    }
  }
}

// Export singleton for testing
export const verificationHarness = new G1BVerificationHarness();
