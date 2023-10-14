import { z } from "zod"
import { id } from "~/helper/zodTypes"
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
} from "~/server/api/trpc"
import { prisma } from "~/server/db"

export const itemRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.item.findMany({ include: { categories: true } })
  }),
  
  getBuyable: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.item.findMany({ where:{is_active: true, for_grouporders: false}, include: { categories: true } })
  }),

  createItem: adminProcedure
    .input(
      z.object({
        name: z.string(),
        categories: z.array(id),
        price: z.number(),
        for_grouporders: z.boolean().optional().default(false)
      })
    )
    .mutation(async ({ ctx, input }) => {
      const categories = await Promise.all(
        input.categories.map(async (categoryId) => {
          return prisma.category.findUniqueOrThrow({
            where: {
              id: categoryId,
            },
          })
        })
      )

      const item = await prisma.item.create({
        data: {
          name: input.name,
          price: input.price,
          categories: { connect: categories.map((category) => ({ id: category.id })) },
          is_active: true,
          for_grouporders: input.for_grouporders
        },
      })
      return item
    }),

  getGroupBuyOptions: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.item.findMany({
      where: { for_grouporders: true, is_active: true },
      include: { categories: true },
    })
  }),

  buyOneItem: protectedProcedure
    .input(z.object({ productID: id }))
    .mutation(async ({ ctx, input }) => {
      const product = await prisma.item.findUniqueOrThrow({
        where: {
          id: input.productID,
        },
      })
      const quantity = 1 // currently only single item purchases supported

      // atomic action:
      await prisma.$transaction([
        prisma.transaction.create({
          data: {
            quantity: quantity,
            // userId: ctx.session.user.id,
            user: { connect: { id: ctx.session.user.id } },
            // itemId: product.id,
            item: { connect: { id: product.id } },
            type: 0,
            totalAmount: product.price * quantity,
          },
        }),
        prisma.user.update({
          where: { id: ctx.session.user.id },
          data: { balance: { decrement: product.price } },
        }),
      ])
    }),
})
