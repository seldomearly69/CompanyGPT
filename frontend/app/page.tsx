"use client";

import { useEffect, useState } from "react";
import LoggedOutLandingPage from "@/components/LoggedOutLandingPage";
import LoggedInLandingPage from "@/components/LoggedInLandingPage";

export default function LandingPage() {
  console.log(1)
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    console.log("user: ", user)
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        console.log("data", data)
        if (data.user) {
          setUser(data.user);
        }
        console.log("user: ", user)
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch session:", error);
        console.log("user: ", user)
        setIsLoading(false);
      });
  }, []);
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  return user ? (
    <LoggedInLandingPage user={user} />
  ) : (
    <LoggedOutLandingPage />
  );
}
