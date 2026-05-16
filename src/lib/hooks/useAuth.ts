import { useCallback, useEffect, useState } from "react";

type DevUserShape = {
  id?: string;
  email?: string;
  role?: string;
  isAuthenticated?: boolean;
};

export const useAuth = () => {
  const [devUser, setDevUser] = useState<DevUserShape | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("dev_user");
    if (!stored) return;
    try {
      setDevUser(JSON.parse(stored) as DevUserShape);
    } catch {
      localStorage.removeItem("dev_user");
    }
  }, []);

  const login = async (_email: string, _password: string) => {
    throw new Error(
      "Server login is disabled in this static demo. Use the home page or /login to enter the mock POC.",
    );
  };

  const requestOTP = async (_phone: string, _purpose: string): Promise<void> => {
    throw new Error("Phone OTP is not available in this static demo.");
  };

  const logout = useCallback(async () => {
    localStorage.removeItem("dev_user");
    setDevUser(null);
  }, []);

  return {
    user: devUser,
    isLoading: false,
    isAuthenticated: !!devUser,
    login,
    requestOTP,
    logout,
  };
};
