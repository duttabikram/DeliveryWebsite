export function getAuthUser() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));

    return {
      token,                 // ✅ REQUIRED
      userId: payload.userId,
      role: payload.role,
      email: payload.email,
    };
  } catch (err) {
    console.error("Invalid token", err);
    localStorage.removeItem("token");
    return null;
  }
}

