import { UserDocument } from '../@types/models/user';

import { USER_IPS_RETENTION_LIMIT } from '../constants/env';

const updateUserIp = async (user: UserDocument, ip: string) => {
  const now = new Date();

  try {
    if (user.lastIp !== ip) {
      user.lastIp = ip;
    }

    const existingIpIndex = user.ipHistory.findIndex(
      (entry) => entry.ip === ip
    );

    if (existingIpIndex !== -1) {
      user.ipHistory[existingIpIndex].updatedAt = now;
    } else {
      const newIpEntry = {
        ip,
        createdAt: now,
        updatedAt: now,
      };
      user.ipHistory.push(newIpEntry);
    }

    user.ipHistory.sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );

    if (user.ipHistory.length > USER_IPS_RETENTION_LIMIT) {
      user.ipHistory = user.ipHistory.slice(0, USER_IPS_RETENTION_LIMIT);
    }

    await user.save();
  } catch (error) {
    console.error('Error updating user IP:', error);
  }
};

export default updateUserIp;
