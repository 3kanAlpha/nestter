"use server";

import { cache } from 'react';
import { eq } from "drizzle-orm";

import { db } from "@/db/client";

import { comps } from "@/db/schema";

async function _getCompBySlug(slug: string) {
  const res = await db.select().from(comps).where(eq(comps.slug, slug)).limit(1);
  return res.length > 0 ? res[0] : null;
}

/** slugから大会を取得する */
export const getCompBySlug = cache(_getCompBySlug);