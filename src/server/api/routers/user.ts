import { z } from "zod"
import { env } from "~/env.mjs"
import { id } from "~/helper/zodTypes"

import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc"

export const userRouter = createTRPCRouter({
  getMe: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
    })
  }),

  getUser: adminProcedure
    .input(z.object({ id }))
    .query(({ ctx, input }) => {
      return ctx.prisma.user.findUnique({
        where: { id: input.id },
      })
    }),

  updateUser: adminProcedure
    .input(z.object({ id, allowOverdraw: z.boolean() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: { id: input.id },
        data: { allowOverdraw: input.allowOverdraw },
      })
    }),

  getCtx: publicProcedure.query(({ ctx }) => {
    return {
      LDAP_URL: env.LDAP_URL,
      LDAP_BIND_USER: env.LDAP_BIND_USER,
      LDAP_BIND_PASSWORT: env.LDAP_BIND_PASSWORT,
      LDAP_SEARCH_BASE: env.LDAP_SEARCH_BASE,
      LDAP_ADMIN_GROUP: env.LDAP_ADMIN_GROUP,
    }
  }),

  // Disabled as name is taken from LDAP
  // updateMe: protectedProcedure
  //   .input(
  //     z.object({
  //       name: z.string(),
  //     })
  //   )
  //   .mutation(async ({ ctx, input }) => {
  //     const user = await ctx.prisma.user.update({
  //       where: { id: ctx.session.user.id },
  //       data: { name: input.name },
  //     })
  //     return user
  //   }),

  getAllUsers: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findMany({
      select: { name: true, id: true },
      orderBy: { name: "asc" },
    })
  }),

  getAllUsersWithAllowOverdraw: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findMany({
      where: { allowOverdraw: true },
      select: { name: true, id: true },
      orderBy: { name: "asc" },
    })
  }),

  getAllBalances: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findMany({
      select: { name: true, id: true, balance: true },
      orderBy: { name: "asc" },
    })
  }),

  getAllUsersDetailed: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findMany({
      select: { name: true, id: true, is_admin: true, balance: true, allowOverdraw: true },
      orderBy: { name: "asc" },
    })
  }),
})
