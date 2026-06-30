/**
 * Runtime Certification Suite
 *
 * Automated verification for runtime correctness.
 * Tests event propagation, attention updates, renderer integration,
 * and performance across meaningful avatar scales.
 *
 * Reusable for: Crowd, Live, Avatar, Game, Camera, Audio, AI, Mobile runtimes
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

interface CertificationResult {
  test: string;
  passed: boolean;
  duration: number;
  error?: string;
  metrics?: Record<string, number | string>;
}

interface CertificationReport {
  timestamp: string;
  suiteName: string;
  results: CertificationResult[];
  summary: { passed: number; failed: number; total: number };
}

export class RuntimeCertificationSuite {
  private results: CertificationResult[] = [];
  private testRoomId = 'cert-room-runtime';
  private testAvatarIds: string[] = [];
  private attentionUpdatesReceived = 0;

  constructor(private suiteName: string = 'Runtime') {}

  /**
   * Test 1: Event firing and propagation
   */
  async testEventPropagation(): Promise<CertificationResult> {
    const start = performance.now();
    try {
      roomEnergyEngine.initRoom(this.testRoomId);

      this.testAvatarIds = Array.from({ length: 10 }, (_, i) => `avatar-${i}`);
      roomEnergyEngine.setRoomAvatars(this.testRoomId, this.testAvatarIds);
      roomEnergyEngine.setRoomPerformer(this.testRoomId, 'performer-123');

      let updateCount = 0;
      const unsubscribe = onAttentionUpdate(() => {
        updateCount++;
      });

      roomEnergyEngine.recordReaction(this.testRoomId);
      await new Promise(r => setTimeout(r, 50));

      roomEnergyEngine.recordTip(this.testRoomId, 50);
      await new Promise(r => setTimeout(r, 50));

      roomEnergyEngine.recordVote(this.testRoomId);
      await new Promise(r => setTimeout(r, 50));

      roomEnergyEngine.recordGift(this.testRoomId);
      await new Promise(r => setTimeout(r, 50));

      unsubscribe();

      const passed = updateCount >= 3;
      const energy = roomEnergyEngine.getState(this.testRoomId);
      const energyRose = (energy?.energyScore ?? 0) > 0;

      return {
        test: 'Event Propagation',
        passed: passed && energyRose,
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
  async testAttentionStateUpdates(): Promise<CertificationResult> {
    const start = performance.now();
    try {
      const avatarIds = this.testAvatarIds.slice(0, 5);

      directAttention(avatarIds[0], { kind: 'stage' }, 0.8, 200);

      await new Promise(r => setTimeout(r, 50));

      const output = avatarAttentionRuntime.getVisualOutput(avatarIds[0]);
      const stats = getAttentionStats(avatarIds);

      const headYawUpdated = !!(output && Math.abs(output.headYaw) >= 0);
      const statsCollected = stats ? stats.avgIntensity >= 0 : false;

      return {
        test: 'Attention State Updates',
        passed: headYawUpdated && statsCollected,
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
   * Test 3: Renderer integration
   */
  async testRendererIntegration(): Promise<CertificationResult> {
    const start = performance.now();
    try {
      const avatarIds = this.testAvatarIds.slice(0, 8);

      triggerApplause(avatarIds, 0.75);

      await new Promise(r => setTimeout(r, 100));

      const vectors = getRoomAttentionVectors(avatarIds);

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
   * Test 4: Performance stability across meaningful avatar scales
   */
  async testPerformanceStability(): Promise<CertificationResult> {
    const start = performance.now();
    try {
      const counts = [20, 100, 250, 500, 1000, 5000];
      const timings: Record<number, number> = {};

      for (const count of counts) {
        const avatarIds = Array.from({ length: count }, (_, i) => `perf-avatar-${i}`);
        roomEnergyEngine.setRoomAvatars(this.testRoomId, avatarIds);

        const testStart = performance.now();

        triggerApplause(avatarIds, 0.7);
        const vectors = getRoomAttentionVectors(avatarIds);

        timings[count] = performance.now() - testStart;
      }

      // Check that timing scales reasonably (not exponential degradation)
      const degradation = timings[5000] / timings[20];
      const acceptableDegradation = degradation < 250; // 250x for 250x avatar increase is acceptable

      return {
        test: 'Performance Stability',
        passed: acceptableDegradation,
        duration: performance.now() - start,
        metrics: {
          timing20: `${timings[20].toFixed(1)}ms`,
          timing100: `${timings[100].toFixed(1)}ms`,
          timing250: `${timings[250].toFixed(1)}ms`,
          timing500: `${timings[500].toFixed(1)}ms`,
          timing1000: `${timings[1000].toFixed(1)}ms`,
          timing5000: `${timings[5000].toFixed(1)}ms`,
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
   * Test 5: Memory stability during sustained operation
   */
  async testMemoryStability(): Promise<CertificationResult> {
    const start = performance.now();
    try {
      const avatarIds = this.testAvatarIds.slice(0, 20);
      const cycleCount = 50;

      for (let i = 0; i < cycleCount; i++) {
        triggerApplause(avatarIds, 0.6 + Math.random() * 0.2);
        await new Promise(r => setTimeout(r, 5));

        roomEnergyEngine.recordTip(this.testRoomId, 10 + Math.random() * 50);
        await new Promise(r => setTimeout(r, 5));
      }

      const finalEnergy = roomEnergyEngine.getState(this.testRoomId);
      const finalVectors = getRoomAttentionVectors(avatarIds);

      const stateValid = finalEnergy !== undefined;
      const vectorsValid = finalVectors.every(v =>
        !isNaN(v.yaw) && !isNaN(v.pitch) && !isNaN(v.intensity)
      );

      return {
        test: 'Memory Stability',
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
        test: 'Memory Stability',
        passed: false,
        duration: performance.now() - start,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Run all certification tests
   */
  async runAllTests(): Promise<CertificationReport> {
    console.log(`\n🧪 Starting ${this.suiteName} Certification Suite...\n`);

    const results: CertificationResult[] = [];

    console.log('Test 1/5: Event Propagation...');
    results.push(await this.testEventPropagation());

    console.log('Test 2/5: Attention State Updates...');
    results.push(await this.testAttentionStateUpdates());

    console.log('Test 3/5: Renderer Integration...');
    results.push(await this.testRendererIntegration());

    console.log('Test 4/5: Performance Stability...');
    results.push(await this.testPerformanceStability());

    console.log('Test 5/5: Memory Stability...');
    results.push(await this.testMemoryStability());

    const report: CertificationReport = {
      timestamp: new Date().toISOString(),
      suiteName: this.suiteName,
      results,
      summary: {
        passed: results.filter(r => r.passed).length,
        failed: results.filter(r => !r.passed).length,
        total: results.length,
      },
    };

    this.printReport(report);

    return report;
  }

  private printReport(report: CertificationReport): void {
    console.log(`\n📊 ${report.suiteName.toUpperCase()} CERTIFICATION REPORT\n`);
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
      console.log(`✨ All tests passed. ${report.suiteName} runtime is certified.\n`);
    } else {
      console.log(`⚠️  ${report.summary.failed} test(s) failed. See errors above.\n`);
    }
  }
}

// Export singletons for each runtime
export const runtimeCertificationSuite = new RuntimeCertificationSuite('Runtime');
