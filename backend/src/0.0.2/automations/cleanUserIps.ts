import cron from 'node-cron';
import { Types } from 'mongoose';

import {
  CLEAN_USER_IPS_CRON_SCHEDULE,
  USER_IPS_RETENTION_LIMIT,
} from '../constants/env';

import { UserDocument } from '../@types/models/user';

import UserModel from '../models/user.models';

type IPAddress = {
  ip: string;
  updatedAt: Date;
};

const cleanUserIps = async (): Promise<void> => {
  try {
    const bulkOps: {
      updateOne: {
        filter: { _id: Types.ObjectId };
        update: { $set: { ipAddresses: IPAddress[] } };
      };
    }[] = [];

    let totalIpsDeleted = 0;

    const users: UserDocument[] = await UserModel.find({}, { ipAddresses: 1 });

    users.forEach(({ _id, ipAddresses = [] }) => {
      const sortedIps = ipAddresses
        .map((ipDoc) => ({
          ip: ipDoc.ip,
          updatedAt:
            ipDoc.updatedAt instanceof Date
              ? ipDoc.updatedAt
              : new Date(ipDoc.updatedAt),
        }))

        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

      const validIps = sortedIps.slice(0, USER_IPS_RETENTION_LIMIT);

      if (validIps.length !== ipAddresses.length) {
        totalIpsDeleted += ipAddresses.length - validIps.length;

        bulkOps.push({
          updateOne: {
            filter: { _id: _id as Types.ObjectId },
            update: { $set: { ipAddresses: validIps } },
          },
        });
      }
    });

    if (bulkOps.length > 0) {
      const result = await UserModel.bulkWrite(bulkOps);

      console.log(
        `Expired IPs cleaned successfully. ${result.modifiedCount} user(s) updated, ${totalIpsDeleted} IP(s) deleted.`
      );
    } else {
      console.log('No IPs to clean.');
    }
  } catch (error) {
    console.error('Error while cleaning IPs:', error);
  }
};

cron.schedule(CLEAN_USER_IPS_CRON_SCHEDULE, cleanUserIps);
