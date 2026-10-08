import axios from "axios";

const API_BASE = "http://localhost:5000/api/v1";

async function testRegistration() {
  console.log("======================================================");
  console.log("🧪 Testing User Registration Flow");
  console.log(`🎯 Target API: ${API_BASE}/auth/register`);
  console.log("======================================================\n");

  const timestamp = Date.now();
  const testUser = {
    email: `student_${timestamp}@campusoj.edu`,
    password: "Password123!",
    fullName: `Test Student ${timestamp}`,
    college: "CampusOJ Engineering College",
    role: "STUDENT",
  };

  console.log(`Registering new user: ${testUser.email}...`);
  const startTime = Date.now();

  try {
    const res = await axios.post(`${API_BASE}/auth/register`, testUser);
    const duration = Date.now() - startTime;

    console.log(`\n✓ Registration succeeded in ${duration}ms!`);
    console.log("Response status:", res.status);
    console.log("Response data:", JSON.stringify(res.data, null, 2));

    if (res.data.success && res.data.data?.email === testUser.email) {
      console.log("\n🎉 VERIFICATION SUCCESS: New account registered without timing out!");
    } else {
      console.error("❌ Unexpected response shape:", res.data);
      process.exit(1);
    }
  } catch (err: any) {
    const duration = Date.now() - startTime;
    console.error(`\n❌ Registration failed after ${duration}ms:`, err.response?.data ?? err.message);
    process.exit(1);
  }
}

testRegistration();
