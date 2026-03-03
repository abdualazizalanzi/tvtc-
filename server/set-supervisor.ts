// Script to set user as supervisor
import { authStorage } from "./replit_integrations/auth/storage.js";
import { storage } from "./storage.js";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

async function setUserAsSupervisor(email: string) {
  console.log(`🔍 Looking for user with email: ${email}`);
  
  // Find user by email
  let user = await authStorage.getUserByEmail(email);
  
  if (!user) {
    console.log("❌ User not found! Creating new user...");
    
    // Create a temporary password (user should change it)
    const hashedPassword = await bcrypt.hash("TempPassword123!", 10);
    
    // Create user
    user = await authStorage.upsertUser({
      id: randomUUID(),
      email: email,
      firstName: "عبدالعزيز",
      lastName: "المستخدم",
      password: hashedPassword,
    });
    
    console.log(`✅ New user created: ${user.id}`);
  }
  
  console.log(`✅ User found: ${user.firstName} ${user.lastName} (${user.id})`);
  
  // Update role to supervisor
  const profile = await storage.updateUserRole(user.id, "supervisor");
  
  console.log(`✅ User role updated to: ${profile.role}`);
  console.log("🎉 Done!");
}

const email = process.argv[2];

if (!email) {
  console.log("Usage: npx tsx server/set-supervisor.ts <email>");
  console.log("Example: npx tsx server/set-supervisor.ts azoo0506167@gmail.com");
  process.exit(1);
}

setUserAsSupervisor(email).catch(console.error);

