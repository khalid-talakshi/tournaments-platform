import { prisma } from "./client";
import bcrypt from "bcryptjs";

const main = async () => {
  const categories = [
    {
      code: "B08",
      name: "Boys 12-14",
      minAge: 12,
      maxAge: 14,
    },
    {
      code: "B05",
      name: "Boys 15-17",
      minAge: 12,
      maxAge: 17,
    },
    {
      code: "M02",
      name: "Mens 18-20",
      minAge: 12,
      maxAge: 20,
    },
    {
      code: "M01",
      name: "Mens 21+",
      minAge: 12,
    },
    {
      code: "M87",
      name: "Mens 35+",
      minAge: 35,
    },
    {
      code: "M75",
      name: "Mens 47+",
      minAge: 47,
    },
    {
      code: "G05",
      name: "Girls 15-17",
      minAge: 15,
      maxAge: 17,
      female: true,
    },
    {
      code: "W04",
      name: "Womens 18+",
      minAge: 15,
      female: true,
    },
  ];

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

  // console.log("Seeding Categories");

  // for (const category of categories) {
  //   const categoryEntry = await prisma.category.findFirst({
  //     where: {
  //       code: category.code,
  //     },
  //   });

  //   if (categoryEntry) {
  //     console.log("category already exists", categoryEntry);
  //     continue;
  //   } else {
  //     const newCategory = await prisma.category.create({
  //       data: category,
  //     });

  //     console.log("seeded category", newCategory);
  //   }
  // }
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
