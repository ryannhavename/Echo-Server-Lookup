'use client';

import { motion, AnimatePresence } from 'framer-motion';

function SkeletonCard({ className = '', children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={`bg-white/[0.02] border border-white/5 rounded-2xl p-4 ${className}`}>
      {children}
    </div>
  );
}

function SkeletonLine({ width = 'w-full', height = 'h-4', className = '' }: { width?: string; height?: string; className?: string }) {
  return (
    <div className={`bg-white/5 rounded animate-pulse-slow ${width} ${height} ${className}`} />
  );
}

export function ServerSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
      style={{ willChange: 'opacity' }}
    >
      {/* Header Skeleton */}
      <div className="bg-white/[0.03] border border-white/10 rounded-3xl backdrop-blur-xl glass-card p-6">
        <div className="flex items-center gap-4">
          <SkeletonLine width="w-12" height="h-12" className="rounded-xl" />
          <div className="space-y-2 flex-1">
            <SkeletonLine width="w-48" height="h-6" />
            <SkeletonLine width="w-32" height="h-4" />
          </div>
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SkeletonCard>
          <SkeletonLine width="w-24" height="h-5" className="mb-3" />
          <SkeletonLine width="w-16" height="h-8" className="mb-3" />
          <SkeletonLine height="h-2" />
        </SkeletonCard>

        <SkeletonCard>
          <SkeletonLine width="w-24" height="h-5" className="mb-3" />
          <SkeletonLine width="w-32" height="h-6" className="mb-2" />
          <SkeletonLine width="w-24" height="h-6" />
        </SkeletonCard>

        <SkeletonCard>
          <SkeletonLine width="w-24" height="h-5" className="mb-3" />
          <SkeletonLine width="w-16" height="h-8" />
        </SkeletonCard>
      </div>

      {/* MOTD Skeleton */}
      <div className="px-6 py-4 border-t border-white/5">
        <SkeletonCard>
          <SkeletonLine width="w-20" height="h-4" className="mb-2" />
          <SkeletonLine height="h-4" className="mb-1" />
          <SkeletonLine height="h-4" className="w-3/4" />
        </SkeletonCard>
      </div>
    </motion.div>
  );
}
