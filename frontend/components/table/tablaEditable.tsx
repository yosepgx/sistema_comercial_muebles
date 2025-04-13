type Payment = {
  id: string
  amount: number
  status: "pending" | "processing" | "success" | "failed"
  email: string
}

export const payments: Payment[] = [
  { id: "a1b2c3d4", amount: 100, status: "pending", email: "user1@example.com" },
  { id: "e5f6g7h8", amount: 250, status: "success", email: "user2@example.com" },
  { id: "i9j0k1l2", amount: 75, status: "processing", email: "user3@example.com" },
  { id: "m3n4o5p6", amount: 300, status: "failed", email: "user4@example.com" },
  { id: "q7r8s9t0", amount: 150, status: "pending", email: "user5@example.com" },
  { id: "u1v2w3x4", amount: 180, status: "success", email: "user6@example.com" },
  { id: "y5z6a7b8", amount: 90, status: "processing", email: "user7@example.com" },
  { id: "c9d0e1f2", amount: 220, status: "success", email: "user8@example.com" },
  { id: "g3h4i5j6", amount: 135, status: "pending", email: "user9@example.com" },
  { id: "k7l8m9n0", amount: 160, status: "processing", email: "user10@example.com" },
  { id: "o1p2q3r4", amount: 190, status: "success", email: "user11@example.com" },
  { id: "s5t6u7v8", amount: 210, status: "failed", email: "user12@example.com" },
  { id: "w9x0y1z2", amount: 80, status: "pending", email: "user13@example.com" },
  { id: "a3b4c5d6", amount: 60, status: "success", email: "user14@example.com" },
  { id: "e7f8g9h0", amount: 170, status: "processing", email: "user15@example.com" },
  { id: "i1j2k3l4", amount: 240, status: "success", email: "user16@example.com" },
  { id: "m5n6o7p8", amount: 130, status: "pending", email: "user17@example.com" },
  { id: "q9r0s1t2", amount: 195, status: "success", email: "user18@example.com" },
  { id: "u3v4w5x6", amount: 110, status: "processing", email: "user19@example.com" },
  { id: "y7z8a9b0", amount: 125, status: "failed", email: "user20@example.com" },
];
