//Thêm thư viện giải mã JWT (JASON WEB TOKEN)
import { jwtDecode } from "jwt-decode";

export const decodeGoogleToken = (credetial) => {
  try {
    const decoded = jwtDecode(credetial);
    return {
      name: decoded.name,
      email: decoded.email,
      avatar: decoded.picture,
    };
  } catch (error) {
    console.error("Lỗi khi gửi mã Google Token: ", error);
    return null;
  }
};
