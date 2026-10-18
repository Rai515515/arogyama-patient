import { useMemo } from 'react';
import { useStore } from './useStore';
import { stageContext, type StageContext } from '../domain/seed';
import type { StageTag } from '../content/facts';

export interface StageInfo extends StageContext {
  tag: StageTag;
  /** 1–9 month of pregnancy (approximate, for people who think in months) */
  month: number;
}

export function stageTagOf(ctx: StageContext): StageTag {
  if (ctx.stage === 'POSTPARTUM') return 'PP';
  if (ctx.weeks < 13) return 'T1';
  if (ctx.weeks < 27) return 'T2';
  return 'T3';
}

export function useStage(): StageInfo {
  const stage = useStore((s) => s.user.stage);
  const dueDate = useStore((s) => s.user.dueDate);
  const deliveryDate = useStore((s) => s.user.deliveryDate);
  return useMemo(() => {
    const ctx = stageContext(stage, dueDate, deliveryDate);
    return { ...ctx, tag: stageTagOf(ctx), month: Math.min(9, Math.max(1, Math.ceil((ctx.weeks + 0.5) / 4.345))) };
  }, [stage, dueDate, deliveryDate]);
}
