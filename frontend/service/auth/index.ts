export async function authenticateUser(email: string, password: string) {
    console.log("auth reached");
    const response = await fetch(`${process.env.AUTH_API_URL}`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  
    return response;
  }