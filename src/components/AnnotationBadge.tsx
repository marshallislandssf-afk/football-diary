import { Annotation } from '@/lib/types';
import clsx from 'clsx';

interface Props {
  annotation: Annotation;
  compact?: boolean;
}

const TYPE_STYLES: Record<string, string> = {
  promotion: 'bg-[#3fb950]/15 text-[#3fb950] border-[#3fb950]/30',
  milestone: 'bg-[#e3b341]/15 text-[#e3b341] border-[#e3b341]/30',
  special: 'bg-[#bc8cff]/15 text-[#bc8cff] border-[#bc8cff]/30',
  goal: 'bg-[#58a6ff]/15 text-[#58a6ff] border-[#58a6ff]/30',
  custom: 'bg-[#8b949e]/15 text-[#8b949e] border-[#8b949e]/30',
};

export function AnnotationBadge({ annotation, compact }: Props) {
  return (
    <div
      className={clsx(
        'flex items-start gap-1.5 border rounded-lg text-xs font-medium',
        TYPE_STYLES[annotation.type] || TYPE_STYLES.custom,
        compact ? 'px-2 py-1 max-w-[160px]' : 'px-3 py-2 max-w-full'
      )}
    >
      {annotation.emoji && (
        <span className="text-sm leading-none mt-0.5">{annotation.emoji}</span>
      )}
      <span className={compact ? 'truncate' : 'leading-snug'}>
        {annotation.text}
      </span>
    </div>
  );
}
