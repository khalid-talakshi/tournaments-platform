import { prisma } from "./client";
import bcrypt from "bcryptjs";

const main = async () => {
  const userToAdd = {
    username: process.env.ADMIN_USER,
    password: bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10),
    permission: "ADMIN",
  };
  console.log("data", userToAdd);
  console.log(`Start seeding ...`);
  const adminUser = await prisma.user.findFirst({
    where: {
      username: process.env.ADMIN_USER,
    },
  });
  if (!adminUser) {
    const user = await prisma.user.create({
      data: userToAdd,
    });

    console.log("seeded user", user);
  } else {
    console.log("user already exists");
  }
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
