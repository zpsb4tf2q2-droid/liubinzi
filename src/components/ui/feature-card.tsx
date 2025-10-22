import type { ReactNode } from 'react';

export type FeatureCardProps = {
  title: string;
  description: string;
  icon?: ReactNode;
};

const FeatureCard = ({ title, description, icon }: FeatureCardProps): JSX.Element => {
  return (
    <div className="group relative flex flex-col gap-3 rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-lg">
      {icon ? (
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {icon}
        </div>
      ) : null}
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-600">{description}</p>
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1 rounded-b-3xl bg-gradient-to-r from-primary to-cyan-500 opacity-0 transition group-hover:opacity-100" />
    </div>
  );
};

export default FeatureCard;
