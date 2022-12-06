const JWT = require("jsonwebtoken");
const { keys } = require("../config.js");
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const createGroup = async (req, res) => {
  const { jwtToken } = req.body;

  var decodedJwt = JWT.verify(jwtToken, keys.jwt);

  let group = "";

  if (
    await prisma.Group.findUnique({
      where: {
        creatorId: decodedJwt.id,
      },
    })
  ) {
    res.status(200).json("Группа с таким лидером уже существует");
  } else {
    group = await prisma.Group.create({
      data: {
        creatorId: decodedJwt.id,
        coUser: 0,
      },
    });

    res.status(200).json("Группа создана");
  }
};

const addGroup = async (req, res) => {
  const { name, jwtToken } = req.body;

  const user = await prisma.User.findUnique({
    where: {
      name: name,
    },
  });

  const groupName = await prisma.Group.findUnique({
    where: {
      creatorId: user.id,
    },
  });

  if (groupName) {
    return res.status(200).json("Этот участник уже в группе");
  }

  if (!user) {
    console.log(123);
    return res.status(200).json("Такого пользователя нет");
  }

  const { invitations } = user;

  var decodedJwt = JWT.verify(jwtToken, keys.jwt);

  const group = await prisma.Group.findUnique({
    where: {
      creatorId: decodedJwt.id,
    },
  });

  if (user.id == decodedJwt.id) {
    return res.status(200).json("Нельзя отправить приглашение самому себе");
  }

  if (!invitations.includes(group.groupId)) {
    if (group) {
      invitations.push(group.groupId);

      const { user } = await prisma.User.update({
        where: {
          name: name,
        },
        data: {
          invitations: invitations,
        },
      });

      res.status(200).json("Приглашение отправлено");
    } else {
      res.status(200).json("Такой группы не существует");
    }
  } else {
    res.status(200).json("Вы уже отправляли приглашение ему");
  }
};

const acceptGroup = async (req, res) => {
  const { jwtToken, groupId } = req.body;

  var decodedJwt = JWT.verify(jwtToken, keys.jwt);

  const allGroupsLeader = await prisma.Group.findUnique({
    where: {
      creatorId: decodedJwt.id,
    },
  });

  const allGroupsCo = await prisma.Group.findMany({
    where: {
      coUser: decodedJwt.id,
    },
  });

  if (allGroupsLeader == null && allGroupsCo.length == 0) {
    await prisma.Group.update({
      where: {
        groupId: groupId,
      },
      data: {
        coUser: decodedJwt.id,
      },
    });

    await prisma.User.update({
      where: {
        id: decodedJwt.id,
      },
      data: {
        invitations: [],
      },
    });

    return res.status(200).json("Вы вошли в группу");
  }

  return res.status(200).json("Вы уже состоите в группе");
};

const declineGroup = async (req, res) => {
  const { jwtToken, groupId } = req.body;

  var decodedJwt = JWT.verify(jwtToken, keys.jwt);

  const { invitations } = await prisma.User.findUnique({
    where: {
      id: decodedJwt.id,
    },
  });

  const newInvitations = invitations.filter((elem) => elem != groupId);

  await prisma.User.update({
    where: {
      id: decodedJwt.id,
    },
    data: {
      invitations: newInvitations,
    },
  });

  res.status(200).json("Заявка отклонена");
};

const checkInvitations = async (req, res) => {
  const { jwtToken } = req.body;

  var decodedJwt = JWT.verify(jwtToken, keys.jwt);

  const { invitations } = await prisma.User.findUnique({
    where: {
      id: decodedJwt.id,
    },
  });

  res.status(200).json(invitations);
};

const deleteGroup = async (req, res) => {
  const { jwtToken } = req.body;

  var decodedJwt = JWT.verify(jwtToken, keys.jwt);

  const group = await prisma.Group.delete({
    where: {
      creatorId: decodedJwt.id,
    },
  });

  res.status(200).json("Группа удалена");
};

const infoAboutGroup = async (req, res) => {
  const { jwtToken } = req.body;

  var decodedJwt = JWT.verify(jwtToken, keys.jwt);

  const { id } = decodedJwt;

  const groupesInCoUser = await prisma.Group.findMany({
    where: { coUser: id },
  });

  const groupesInLeader = await prisma.Group.findMany({
    where: { creatorId: id },
  });

  var coUserNickname = 0;

  if (groupesInLeader[0]?.coUser > 0) {
    coUserNickname = await prisma.User.findUnique({
      where: {
        id: groupesInLeader[0].coUser,
      },
    });
  }

  const groupInfo = {
    coUser: groupesInCoUser.length > 0 ? true : false,
    leader: groupesInLeader.length > 0 ? true : false,
    coUserId: groupesInLeader.length > 0 ? groupesInLeader[0].coUser : 0,
    coUserNickname: coUserNickname.name ? coUserNickname.name : 0,
  };

  res.status(200).json(groupInfo);
};

const leaveGroup = async (req, res) => {
  const { jwtToken } = req.body;

  var decodedJwt = JWT.verify(jwtToken, keys.jwt);

  const group = await prisma.Group.findMany({
    where: {
      coUser: decodedJwt.id,
    },
  });

  await prisma.Group.update({
    where: { groupId: group[0].groupId },
    data: { coUser: 0 },
  });

  res.status(200).json("Вы вышли из группы");
};

const kickGroup = async (req, res) => {
  const { jwtToken } = req.body;

  var decodedJwt = JWT.verify(jwtToken, keys.jwt);

  const { groupId } = await prisma.Group.findMany({
    where: {
      creatorId: decodedJwt.id,
    },
  }).then((res) => res[0]);

  await prisma.Group.update({
    where: {
      groupId: groupId,
    },
    data: {
      coUser: 0,
    },
  });

  res.status(200).json("Вы кикнули участника из группа");
};

module.exports = {
  createGroup: createGroup,
  addGroup: addGroup,
  acceptGroup: acceptGroup,
  checkInvitations: checkInvitations,
  declineGroup: declineGroup,
  deleteGroup: deleteGroup,
  infoAboutGroup: infoAboutGroup,
  leaveGroup: leaveGroup,
  kickGroup: kickGroup,
};
