const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Ticket = require('../models/Ticket');
const StatusHistory = require('../models/StatusHistory');
const Comment = require('../models/Comment');

dotenv.config();

const performSeed = async (clearExisting = true) => {
  if (clearExisting) {
    console.log('[Seeder] Clearing old records...');
    await User.deleteMany();
    await Category.deleteMany();
    await Ticket.deleteMany();
    await StatusHistory.deleteMany();
    await Comment.deleteMany();
  }

  console.log('[Seeder] Creating users...');
  // Create Users
  const admin = await User.create({
    name: 'System Administrator',
    email: 'admin@helpdesk.com',
    password: 'admin123',
    role: 'admin',
    isActive: true,
  });

  const agent1 = await User.create({
    name: 'Alex Rivera (Support Agent)',
    email: 'agent@helpdesk.com',
    password: 'agent123',
    role: 'agent',
    isActive: true,
  });

  const agent2 = await User.create({
    name: 'Sarah Connor (Senior Agent)',
    email: 'sarah.agent@helpdesk.com',
    password: 'agent123',
    role: 'agent',
    isActive: true,
  });

  const requester1 = await User.create({
    name: 'Michael Scott (Requester)',
    email: 'user@helpdesk.com',
    password: 'user123',
    role: 'requester',
    isActive: true,
  });

  const requester2 = await User.create({
    name: 'Pam Beesly',
    email: 'pam@helpdesk.com',
    password: 'user123',
    role: 'requester',
    isActive: true,
  });

  console.log('[Seeder] Creating categories...');
  const catHardware = await Category.create({
    name: 'Hardware',
    description: 'Issues relating to laptops, desktops, monitors, keyboards, and peripherals',
  });

  const catSoftware = await Category.create({
    name: 'Software',
    description: 'Operating system bugs, software installations, licenses, and errors',
  });

  const catNetwork = await Category.create({
    name: 'Network',
    description: 'WiFi connectivity, VPN access, firewall issues, and internet outages',
  });

  const catBilling = await Category.create({
    name: 'Billing & Accounts',
    description: 'Invoicing, subscription renewals, payments, and account queries',
  });

  const catGeneral = await Category.create({
    name: 'General Inquiry',
    description: 'General support requests, policy queries, and miscellaneous questions',
  });

  console.log('[Seeder] Creating tickets & history...');

  // Ticket 1: Urgent Open Ticket
  const ticket1 = await Ticket.create({
    title: 'VPN Connection Fails When Connecting From Remote Office',
    description: 'Whenever I try to connect to the corporate VPN from the branch office, the client drops with Error Code 800.',
    category: catNetwork._id,
    priority: 'Urgent',
    status: 'Open',
    createdBy: requester1._id,
    assignedTo: null,
  });

  await StatusHistory.create({
    ticket: ticket1._id,
    changedBy: requester1._id,
    oldStatus: 'None',
    newStatus: 'Open',
    comment: 'Ticket opened by user regarding VPN connection failure',
  });

  await Comment.create({
    ticket: ticket1._id,
    user: requester1._id,
    message: 'I have attached screenshots of the error dialog. Need this urgent as I cannot access production DB.',
  });

  // Ticket 2: In Progress Ticket assigned to Alex
  const ticket2 = await Ticket.create({
    title: 'Request second monitor for dual display setup',
    description: 'My workstation requires an additional HDMI monitor for design workflows.',
    category: catHardware._id,
    priority: 'Medium',
    status: 'In Progress',
    createdBy: requester1._id,
    assignedTo: agent1._id,
  });

  await StatusHistory.create({
    ticket: ticket2._id,
    changedBy: requester1._id,
    oldStatus: 'None',
    newStatus: 'Open',
    comment: 'Ticket created for monitor requisition',
  });

  await StatusHistory.create({
    ticket: ticket2._id,
    changedBy: agent1._id,
    oldStatus: 'Open',
    newStatus: 'In Progress',
    comment: 'Approved requisition. Dispatched hardware request to IT warehouse.',
  });

  await Comment.create({
    ticket: ticket2._id,
    user: agent1._id,
    message: 'Hi Michael, your requisition has been processed. The monitor will be delivered by tomorrow afternoon.',
  });

  await Comment.create({
    ticket: ticket2._id,
    user: requester1._id,
    message: 'Thanks Alex! Will be in the office to receive it.',
  });

  // Ticket 3: Resolved Ticket assigned to Sarah
  const ticket3 = await Ticket.create({
    title: 'Cannot access Microsoft Office 365 license',
    description: 'Word and Excel are reporting "Unlicensed Product" after the recent security update.',
    category: catSoftware._id,
    priority: 'High',
    status: 'Resolved',
    createdBy: requester2._id,
    assignedTo: agent2._id,
  });

  await StatusHistory.create({
    ticket: ticket3._id,
    changedBy: requester2._id,
    oldStatus: 'None',
    newStatus: 'Open',
    comment: 'Office licensing issue submitted',
  });

  await StatusHistory.create({
    ticket: ticket3._id,
    changedBy: agent2._id,
    oldStatus: 'Open',
    newStatus: 'In Progress',
    comment: 'Reset enterprise license token on Azure AD portal',
  });

  await StatusHistory.create({
    ticket: ticket3._id,
    changedBy: agent2._id,
    oldStatus: 'In Progress',
    newStatus: 'Resolved',
    comment: 'User confirmed Office apps now open with valid enterprise credentials.',
  });

  await Comment.create({
    ticket: ticket3._id,
    user: agent2._id,
    message: 'License token re-assigned. Please sign out and sign back in to Word.',
  });

  await Comment.create({
    ticket: ticket3._id,
    user: requester2._id,
    message: 'It worked! Thank you so much Sarah.',
  });

  // Ticket 4: Closed Ticket
  const ticket4 = await Ticket.create({
    title: 'Clarification on monthly software invoice charges',
    description: 'Seeking breakdown of the add-on cloud storage cost charged in last month invoice.',
    category: catBilling._id,
    priority: 'Low',
    status: 'Closed',
    createdBy: requester2._id,
    assignedTo: admin._id,
  });

  await StatusHistory.create({
    ticket: ticket4._id,
    changedBy: requester2._id,
    oldStatus: 'None',
    newStatus: 'Open',
    comment: 'Billing clarification request',
  });

  await StatusHistory.create({
    ticket: ticket4._id,
    changedBy: admin._id,
    oldStatus: 'Open',
    newStatus: 'Resolved',
    comment: 'Sent detailed PDF breakdown via billing portal.',
  });

  await StatusHistory.create({
    ticket: ticket4._id,
    changedBy: admin._id,
    oldStatus: 'Resolved',
    newStatus: 'Closed',
    comment: 'Ticket closed after requester confirmed invoice resolution.',
  });

  console.log('====================================================');
  console.log('  [SEED SUCCESS] Database successfully populated!   ');
  console.log('====================================================');
  console.log('Demo Credentials:');
  console.log('  Admin:     admin@helpdesk.com      / admin123');
  console.log('  Agent 1:   agent@helpdesk.com      / agent123');
  console.log('  Agent 2:   sarah.agent@helpdesk.com/ agent123');
  console.log('  Requester: user@helpdesk.com       / user123');
  console.log('  Requester: pam@helpdesk.com        / user123');
  console.log('====================================================');
};

const seedStandalone = async () => {
  try {
    await connectDB();
    await performSeed(true);
    process.exit(0);
  } catch (error) {
    console.error(`[Seeder Error]: ${error.message}`);
    process.exit(1);
  }
};

let seedInProgress = false;
let seedAlreadyChecked = false;

const autoSeedIfEmpty = async () => {
  if (seedAlreadyChecked || seedInProgress) return;
  seedInProgress = true;
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[AutoSeed] Database is empty. Seeding initial test data...');
      await performSeed(false);
    }
    seedAlreadyChecked = true;
  } catch (err) {
    console.warn(`[AutoSeed] Check failed: ${err.message}`);
  } finally {
    seedInProgress = false;
  }
};

if (require.main === module) {
  seedStandalone();
}

module.exports = {
  performSeed,
  autoSeedIfEmpty,
};
