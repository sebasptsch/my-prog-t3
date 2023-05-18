import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCClientError } from "@trpc/client";

export const notesRouter = createTRPCRouter({
  getOne: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;
    const note = await ctx.prisma.note.findUnique({
      where: {
        id: input,
      },
    });

    if (note === null) {
      throw new TRPCClientError("Note not found");
    }

    if (note.userId !== userId) {
      throw new TRPCClientError("Not authorized to view note");
    }

    return note;
  }),
  update: protectedProcedure.input(z.object({
    id: z.string(),
    title: z.string().optional(),
    content: z.string().optional(),
  })).mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;

    const noteToUpdate = await ctx.prisma.note.findUnique({
      where: {
        id: input.id,
      },
    });

    if (noteToUpdate === null) {
      throw new TRPCClientError("Note not found");
    }

    if (noteToUpdate.userId !== userId) {
      throw new TRPCClientError("Not authorized to update note");
    }
  
    const updatedNote = await ctx.prisma.note.update({
      where: {
        id: input.id,
      },
      data: {
        title: input.title,
        content: input.content,
      },
    });

    return updatedNote;
  }),
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        content: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const newNote = await ctx.prisma.note.create({
        data: {
          content: input.content,
          title: input.title,
          userId: userId,
        },
      });
      return newNote;
    }),
  list: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const notes = await ctx.prisma.note.findMany({
      where: {
        userId: userId,
      },
    });

    return notes;
  }),
  delete: protectedProcedure.input(z.string()).mutation(async ({ctx , input}) => {
    const userId = ctx.session.user.id;

    const noteToDelete = await ctx.prisma.note.findUnique({
      where: {
        id: input
      }
    })

    if (noteToDelete === null) {
      throw new TRPCClientError("Note not found")
    }

    if (noteToDelete.userId !== userId) {
      throw new TRPCClientError("Not authorized to delete note")
    }

    const deletedNotes = await ctx.prisma.note.delete({
      where: {
        id: input
      }
    })

    return deletedNotes
  })
});

const arrowFunction = () => {};

function normalFunction() {}
