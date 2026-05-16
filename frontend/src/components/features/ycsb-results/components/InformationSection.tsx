import { cn } from "@/lib/utils";
import {
  INFO_SECTION_WORKLOAD,
  INFO_SECTION_METRICS,
} from "@/utils/ycsb-constants";
import { BenchmarkInfoCard } from "@/components/features/shared/BenchmarkInfoCard";

type Props = { currentTheme?: string };

const Workloads = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
    {Object.entries(INFO_SECTION_WORKLOAD).map(([key, info]) => {
      const Icon = info.icon;
      return (
        <div
          key={key}
          className={cn(
            "p-4 rounded-xl border bg-white dark:bg-neutral-950",
            "border-neutral-200 dark:border-neutral-800",
            "transition-colors duration-200 ease-[var(--ease-out-strong)]",
            "hover:border-neutral-300 dark:hover:border-neutral-700",
          )}
        >
          <div className="flex items-center gap-2.5 mb-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300">
              <Icon className="w-4 h-4" strokeWidth={1.75} />
            </div>
            <div className="space-y-0.5">
              <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-neutral-500">
                Workload {key}
              </div>
              <div className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
                {info.name}
              </div>
            </div>
          </div>
          <div className="text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">
            {info.desc}
          </div>
        </div>
      );
    })}
  </div>
);

const Metrics = () => (
  <div className="space-y-3">
    {Object.entries(INFO_SECTION_METRICS).map(([key, info]) => (
      <div
        key={key}
        className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950"
      >
        <div className="flex items-center justify-between gap-3 mb-2">
          <h4 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            {info.label}
          </h4>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-[0.14em] border border-neutral-200 dark:border-neutral-800 text-neutral-500">
            {info.badge}
          </span>
        </div>
        <p className="text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400 mb-3">
          {info.description}
        </p>
        <div className="flex items-center gap-6 pt-3 border-t border-neutral-200 dark:border-neutral-800 text-[12px]">
          <MetaItem label="Unit">
            <code className="font-mono text-neutral-700 dark:text-neutral-300">
              {info.unit}
            </code>
          </MetaItem>
          <MetaItem label="Interpretation">
            <span className="text-neutral-700 dark:text-neutral-300">
              {info.interpretation}
            </span>
          </MetaItem>
        </div>
      </div>
    ))}
  </div>
);

const MetaItem = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-center gap-2">
    <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-neutral-500">
      {label}
    </span>
    {children}
  </div>
);

const About = () => (
  <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6">
    <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-1 md:gap-6 mb-5">
      <div>
        <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-neutral-500">
          About
        </div>
        <h3 className="mt-1 text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
          YCSB benchmarks
        </h3>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">
      <AboutColumn label="Framework">
        The Yahoo! Cloud Serving Benchmark (YCSB) is a framework for evaluating
        the performance of different database systems under various workload
        scenarios.
      </AboutColumn>
      <AboutColumn label="Workloads">
        Each workload (A–F) represents a different mix of operations that
        simulate real-world usage patterns. The benchmark measures throughput
        and latency across reads, updates, inserts, and scans.
      </AboutColumn>
      <AboutColumn label="Units">
        Latency is measured in microseconds (μs), where 1 millisecond = 1,000
        μs. Percentile metrics (95th, 99th) help identify tail latency and
        ensure consistent performance for most users.
      </AboutColumn>
    </div>
  </div>
);

const AboutColumn = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div>
    <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-neutral-500 mb-1.5">
      {label}
    </div>
    <p>{children}</p>
  </div>
);

export const InformationSection = ({ currentTheme }: Props) => (
  <BenchmarkInfoCard
    currentTheme={currentTheme}
    title="YCSB benchmark information"
    description="Understanding workload characteristics and performance metrics."
    workloadsContent={<Workloads />}
    metricsContent={<Metrics />}
    footer={<About />}
  />
);
