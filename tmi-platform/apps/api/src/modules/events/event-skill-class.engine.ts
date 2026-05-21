import { Injectable } from '@nestjs/common';

export type SkillClass = 'VOCAL' | 'INSTRUMENTAL' | 'DANCE' | 'COMEDY';

@Injectable()
export class EventSkillClassEngine {
  private readonly taxonomy: Record<SkillClass, string[]> = {
    VOCAL: ['SINGER', 'RAPPER', 'SCREAMER', 'OPERA', 'CHOIR'],
    INSTRUMENTAL: ['GUITAR', 'PIANO', 'DRUMS', 'BASS', 'VIOLIN', 'TRUMPET', 'TRADITIONAL_INSTRUMENTS'],
    DANCE: ['HIP_HOP', 'BREAKDANCE', 'BALLET', 'FREESTYLE', 'TRADITIONAL_DANCE'],
    COMEDY: ['STAND_UP', 'ROAST', 'STORYTELLING', 'FREESTYLE_JOKE_OFF'],
  };

  getTaxonomy() {
    return this.taxonomy;
  }

  normalizeSkill(input: { skillClass: string; skillSubclass: string }) {
    const skillClass = input.skillClass.toUpperCase() as SkillClass;
    const skillSubclass = input.skillSubclass.toUpperCase();
    const valid = this.taxonomy[skillClass]?.includes(skillSubclass) ?? false;
    return {
      skillClass,
      skillSubclass,
      valid,
    };
  }

  findCompatibleCandidates(input: {
    requestedClass: string;
    requestedSubclass: string;
    candidates: Array<{ userId: string; skillClass: string; skillSubclass: string }>;
  }) {
    const normalized = this.normalizeSkill({
      skillClass: input.requestedClass,
      skillSubclass: input.requestedSubclass,
    });

    return input.candidates.filter((candidate) => {
      const c = this.normalizeSkill({
        skillClass: candidate.skillClass,
        skillSubclass: candidate.skillSubclass,
      });
      return c.valid && normalized.valid && c.skillClass === normalized.skillClass;
    });
  }
}
