"use client";

import { useEffect } from 'react';
import { pullGlobalSettings } from '@/lib/sync';

export default function GlobalSync() {
  useEffect(() => {
    pullGlobalSettings();
  }, []);

  return null;
}
