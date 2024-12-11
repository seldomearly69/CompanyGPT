export async function chat(input: string) {
    console.log("chat service reached");
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: input }),
      })

      return response
  }

export async function createNewChat(input: string, email: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/new_chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question: input , email: email}),
  });
  return response;
}

export async function getRecentChats(email : string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/recent_chats`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: email }),
  });
  return response;
}

export async function getChatHistory(chatId: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/chat_history/${chatId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response;
}

export async function updateChatHistory(chatId: string, messages: string[]) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/chat_history/${chatId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages: messages }),
  });
  return response;
}