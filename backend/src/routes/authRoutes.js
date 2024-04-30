const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const authenticateToken = require('../middleware/authenticateToken');

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { email: true, name: true, role: true } // Exclude password and other sensitive fields
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving user profile", error: error.message });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  const { name, email, newPassword } = req.body;
  try {
    const updatedData = {};
    if (name) updatedData.name = name;
    if (email) updatedData.email = email;
    if (newPassword) updatedData.password = await bcrypt.hash(newPassword, 10);

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updatedData
    });
    res.json({ message: "Profile updated successfully", user: { email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
});

module.exports = router;
