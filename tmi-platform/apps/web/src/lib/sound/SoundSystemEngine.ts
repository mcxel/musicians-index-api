import { SOUND_THEMES, SoundThemeId } from './SoundThemeRegistry';
import { useSoundSettingsStore } from './SoundSettingsStore';

export type SoundCategory =
  | 'click_primary'
  | 'click_secondary'
  | 'drawer_open'
  | 'drawer_close'
  | 'notification'
  | 'message'
  | 'reward_spawn'
  | 'reward_whoosh'
  | 'reward_deposit'
  | 'success'
  | 'warning'
  | 'broadcast_start';

class SoundSystemEngineClass {
  private ctx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public play(category: SoundCategory, overrideTheme?: SoundThemeId): void {
    const store = useSoundSettingsStore.getState();
    const { masterVolume, clickVolume, notificationVolume, messageVolume, liveEventVolume, purchaseVolume, achievementVolume, activeTheme } = store;

    if (masterVolume <= 0) return;

    let categoryMult = 1.0;
    if (category.startsWith('click')) categoryMult = clickVolume / 100;
    else if (category === 'notification') categoryMult = notificationVolume / 100;
    else if (category === 'message') categoryMult = messageVolume / 100;
    else if (category === 'broadcast_start') categoryMult = liveEventVolume / 100;
    else if (category === 'success') categoryMult = purchaseVolume / 100;
    else if (category.startsWith('reward')) categoryMult = achievementVolume / 100;

    const finalVolume = (masterVolume / 100) * categoryMult;
    if (finalVolume <= 0.001) return;

    const ctx = this.getAudioContext();
    if (!ctx) return;

    const themeId = overrideTheme || activeTheme;
    const theme = SOUND_THEMES[themeId] || SOUND_THEMES.studio;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      let baseFreq = 440 * (theme.basePitch / 440);
      let duration = 0.12;

      switch (category) {
        case 'click_primary':
          baseFreq *= 1.2;
          duration = 0.05;
          osc.type = theme.waveform;
          break;
        case 'click_secondary':
          baseFreq *= 0.9;
          duration = 0.04;
          osc.type = 'sine';
          break;
        case 'drawer_open':
          baseFreq *= 1.5;
          duration = 0.15;
          osc.type = theme.waveform;
          osc.frequency.setValueAtTime(baseFreq * 0.7, now);
          osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.4, now + duration);
          break;
        case 'drawer_close':
          baseFreq *= 1.2;
          duration = 0.12;
          osc.type = theme.waveform;
          osc.frequency.setValueAtTime(baseFreq * 1.3, now);
          osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.6, now + duration);
          break;
        case 'notification':
          baseFreq = 880 * (theme.basePitch / 440);
          duration = 0.2;
          osc.type = 'sine';
          break;
        case 'message':
          baseFreq = 660 * (theme.basePitch / 440);
          duration = 0.08;
          osc.type = 'triangle';
          break;
        case 'reward_spawn':
          baseFreq = 523.25 * (theme.basePitch / 440);
          duration = 0.3;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(baseFreq, now);
          osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + duration);
          break;
        case 'reward_whoosh':
          baseFreq = 300;
          duration = 0.25;
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(baseFreq, now);
          osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.5, now + duration);
          break;
        case 'reward_deposit':
          baseFreq = 1046.5 * (theme.basePitch / 440);
          duration = 0.25;
          osc.type = 'triangle';
          break;
        case 'success':
          baseFreq = 587.33 * (theme.basePitch / 440);
          duration = 0.35;
          osc.type = 'sine';
          break;
        case 'warning':
          baseFreq = 220;
          duration = 0.25;
          osc.type = 'sawtooth';
          break;
        case 'broadcast_start':
          baseFreq = 440;
          duration = 0.5;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + duration);
          break;
      }

      gain.gain.setValueAtTime(finalVolume * 0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration + theme.decayRate);

      osc.start(now);
      osc.stop(now + duration + theme.decayRate);
    } catch (e) {
      console.warn('Audio synthesis failed:', e);
    }
  }

  public testSound(category: SoundCategory = 'click_primary'): void {
    this.play(category);
  }
}

export const SoundSystemEngine = new SoundSystemEngineClass();
export default SoundSystemEngine;
