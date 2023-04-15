import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { TRPCError } from "@trpc/server";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
});

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.post.findMany({
      orderBy: [{ createdAt: "desc" }],
    });
  }),

  create: publicProcedure
    .input(
      z.object({
        image: z.string(),
        title: z.string(),
        description: z.string(),
        content: z.array(
          z.object({
            id: z.string(),
            type: z.string(),
            content: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.create({
        data: {
          image: input.image,
          title: input.title,
          description: input.description,
          content: input.content,
        },
      });

      return post;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findUnique({
        where: { id: input.id },
      });

      if (!post) throw new TRPCError({ code: "NOT_FOUND" });

      return post;
    }),
});
