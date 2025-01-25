import cron from 'node-cron';
import { Types } from 'mongoose';

import {
  CLEAN_USER_IPS_CRON_SCHEDULE,
  USER_IPS_RETENTION_LIMIT,
} from '../constants/env';

import UserModel, { UserDocument } from '../models/user.models';

type IPAddress = {
  ip: string;
  updatedAt: Date;
};

const cleanUserIps = async (): Promise<void> => {
  try {
    const bulkOps: {
      updateOne: {
        filter: { _id: Types.ObjectId }; // Filter to match a specific user.
        update: { $set: { ipAddresses: IPAddress[] } }; // Update operation for the user's IP addresses.
      };
    }[] = []; // Array to hold batch update operations.

    let totalIpsDeleted = 0; // Counter for the total number of deleted IPs.

    // Fetch all users with their IP addresses.
    const users: UserDocument[] = await UserModel.find({}, { ipAddresses: 1 });

    users.forEach(({ _id, ipAddresses = [] }) => {
      // Extract IP address data and ensure `createdAt` is a Date object.
      const sortedIps = ipAddresses
        .map((ipDoc) => ({
          ip: ipDoc.ip,
          updatedAt:
            ipDoc.updatedAt instanceof Date
              ? ipDoc.updatedAt
              : new Date(ipDoc.updatedAt),
        }))
        // Sort IP addresses by creation date in descending order.
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

      // Keep only the valid IP addresses within the retention limit.
      const validIps = sortedIps.slice(0, USER_IPS_RETENTION_LIMIT);

      // If some IPs need to be removed, prepare a bulk update operation.
      if (validIps.length !== ipAddresses.length) {
        totalIpsDeleted += ipAddresses.length - validIps.length;

        bulkOps.push({
          updateOne: {
            filter: { _id: _id as Types.ObjectId }, // Match user by ID.
            update: { $set: { ipAddresses: validIps } }, // Update the user's IPs to only valid ones.
          },
        });
      }
    });

    // Perform the batch update if there are operations to execute.
    if (bulkOps.length > 0) {
      const result = await UserModel.bulkWrite(bulkOps);

      console.log(
        `Expired IPs cleaned successfully. ${result.modifiedCount} user(s) updated, ${totalIpsDeleted} IP(s) deleted.`
      );
    } else {
      console.log('No IPs to clean.'); // Log if no updates were required.
    }
  } catch (error) {
    console.error('Error while cleaning IPs:', error); // Log any errors during the process.
  }
};

// Schedule the cron job to run based on the defined schedule.
cron.schedule(CLEAN_USER_IPS_CRON_SCHEDULE, cleanUserIps);
