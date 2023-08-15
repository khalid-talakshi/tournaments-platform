import { Express } from "express";
import { prisma } from "../prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { ErrorCode } from "../types";
import { UserError } from "aws-sdk/clients/chime";
import { authenticateAdmin } from "../middleware";

export const categoryRoutes = (app: Express) => {
  app.get("/categories", async (req, res) => {
    const { female } = req.query;

    try {
      if (female !== undefined) {
        const categories = await prisma.category.findMany({
          where: {
            female: female === "true" ? true : false,
          },
        });
        res.status(200).json(categories);
      } else {
        const categories = await prisma.category.findMany();
        res.status(200).json(categories);
      }
    } catch (e) {
      res.status(500).json(e);
    }
  });

  app.post("/categories", authenticateAdmin, async (req, res) => {
    const { name, minAge, maxAge, female, code } = req.body;

    try {
      const category = await prisma.category.create({
        data: {
          name,
          minAge,
          maxAge,
          female,
          code,
        },
      });
      res.status(201).json(category);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === "P2002") {
          res.status(400).json({
            code: ErrorCode.CATEGORY_DUPLICATE_NAME,
            message: "A category with this name already exists",
          } as UserError);
        }
      } else {
        res.status(500).json(e);
      }
    }
  });

  app.get("/categories/:id", async (req, res) => {
    const { id } = req.params;
    const { includeTeams } = req.query;

    try {
      if (id[0] === "G" || id[0] === "B" || id[0] === "M" || id[0] === "W") {
        const category = await prisma.category.findUnique({
          where: {
            name: id,
          },
          include: {
            Teams: includeTeams === "true" ? true : false,
          },
        });
        res.status(200).json(category);
      } else {
        const category = await prisma.category.findUnique({
          where: {
            id: parseInt(id),
          },
          include: {
            Teams: includeTeams === "true" ? true : false,
          },
        });
        res.status(200).json(category);
      }
    } catch (e) {
      res.status(500).json(e);
    }
  });

  app.delete("/categories/:id", authenticateAdmin, async (req, res) => {
    const { id } = req.params;

    try {
      const category = await prisma.category.delete({
        where: {
          id: parseInt(id),
        },
      });
      res.status(200).json(category);
    } catch (e) {
      res.status(500).json(e);
    }
  });
};
