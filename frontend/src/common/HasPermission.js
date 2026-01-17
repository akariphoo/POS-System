export const hasPermission = (code) => {
    const userString = localStorage.getItem("user");
    if (!userString) return false;

    const user = JSON.parse(userString);

    // 1. Admin Bypass: If user role is Admin, they get all access
    if (user.role === 'Admin') return true;

    // 2. Permission check: Ensure 'permissions' exists and includes the code
    return user.permissions?.includes(code);
};