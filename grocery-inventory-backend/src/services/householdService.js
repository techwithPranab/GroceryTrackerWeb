'use strict';

const Household = require('../models/Household');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const AppError = require('../utils/AppError');
const crypto = require('crypto');

const createHousehold = async (name, userId) => {
  const existingHousehold = await Household.findOne({ createdBy: userId });
  if (existingHousehold) {
    throw new AppError('You have already created a household. Join or manage existing one.', 409);
  }

  const household = await Household.create({
    name,
    createdBy: userId,
    members: [{ userId, role: 'admin', joinedAt: new Date() }],
  });

  await User.findByIdAndUpdate(userId, { householdId: household._id, role: 'admin' });

  await ActivityLog.create({
    userId,
    householdId: household._id,
    action: 'household_created',
    description: `Household "${household.name}" created.`,
  });

  return household;
};

const getHousehold = async (householdId) => {
  const household = await Household.findById(householdId)
    .populate('createdBy', 'name email avatarInitials')
    .populate('members.userId', 'name email avatarInitials role lastLoginAt');

  if (!household) throw new AppError('Household not found.', 404);
  return household;
};

const getMembers = async (householdId) => {
  const household = await Household.findById(householdId).populate(
    'members.userId',
    'name email avatarInitials role lastLoginAt createdAt'
  );
  if (!household) throw new AppError('Household not found.', 404);
  return household.members;
};

const inviteMember = async (email, householdId, invitedByUserId) => {
  const household = await Household.findById(householdId);
  if (!household) throw new AppError('Household not found.', 404);

  const invitedUser = await User.findOne({ email });

  if (invitedUser) {
    if (invitedUser.householdId?.toString() === householdId.toString()) {
      throw new AppError('This user is already a member of your household.', 409);
    }

    // Directly add user to household
    const alreadyMember = household.members.some(
      (m) => m.userId.toString() === invitedUser._id.toString()
    );

    if (!alreadyMember) {
      household.members.push({
        userId: invitedUser._id,
        role: 'member',
        joinedAt: new Date(),
      });
      await household.save();

      await User.findByIdAndUpdate(invitedUser._id, {
        householdId: household._id,
        role: 'member',
      });

      await ActivityLog.create({
        userId: invitedByUserId,
        householdId,
        action: 'member_joined',
        description: `${invitedUser.name} joined the household.`,
      });
    }
    return { joined: true, user: invitedUser };
  }

  // Generate invite code for non-existing users
  const code = crypto.randomBytes(16).toString('hex');
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

  household.inviteCodes.push({ code, email, expiresAt });
  await household.save();

  await ActivityLog.create({
    userId: invitedByUserId,
    householdId,
    action: 'member_invited',
    description: `Invitation sent to ${email}.`,
    metadata: { inviteCode: code, email },
  });

  return { joined: false, inviteCode: code, email, expiresAt };
};

const updateMemberRole = async (memberId, role, householdId) => {
  const household = await Household.findById(householdId);
  if (!household) throw new AppError('Household not found.', 404);

  const memberIndex = household.members.findIndex(
    (m) => m.userId.toString() === memberId
  );
  if (memberIndex === -1) throw new AppError('Member not found in household.', 404);

  household.members[memberIndex].role = role;
  await household.save();

  await User.findByIdAndUpdate(memberId, { role });
  return household;
};

module.exports = { createHousehold, getHousehold, getMembers, inviteMember, updateMemberRole };
