const JWT = require("jsonwebtoken");
const { keys } = require("../config.js");
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const createUser = async (req, res) => {
  let { email, password, name } = req.body;

  const emailCheck = await prisma.User.findUnique({
    where: {
      email: email,
    },
  });

  const nameCheck = await prisma.User.findUnique({
    where: {
      name: name,
    },
  });

  if (!(nameCheck || emailCheck)) {
    password = bcrypt.hashSync(password, 7);
    const user = await prisma.User.create({
      data: {
        email,
        password,
        name,
        inGroup: false,
        groupId: 0,
      },
    });
    return res.status(200).json(user);
  } else if (nameCheck && emailCheck) {
    res.status(405).send("Такая почта и ник уже используются");
  } else if (nameCheck && !emailCheck) {
    res.status(405).send("Такой ник уже используется");
  } else {
    res.status(405).send("Такая почта уже используется");
  }
};

const getAuthToken = async (req, res) => {
  const { name, password } = req.body;

  const nameCheck = await prisma.User.findUnique({
    where: {
      name: name,
    },
  });

  if (nameCheck) {
    if (bcrypt.compareSync(password, nameCheck.password)) {
      const token = JWT.sign(
        {
          name: nameCheck.email,
          id: nameCheck.id,
        },
        keys.jwt,
        { expiresIn: 60 ** 4 }
      );

      res.status(200).json({
        token: token,
      });
    } else {
      res.status(405).send("Введен неверный пароль");
    }
  } else {
    res.status(405).send("Аккаунт не найден");
  }
};

module.exports = {
  createUser: createUser,
  getAuthToken: getAuthToken,
};
