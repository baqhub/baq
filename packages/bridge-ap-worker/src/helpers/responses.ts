function notFound() {
  return new Response(
    JSON.stringify({
      type: "https://tools.ietf.org/html/rfc9110#section-15.5.5",
      title: "Not Found",
      status: 404,
    }),
    {
      status: 404,
      statusText: "Not Found",
      headers: {
        "Content-Type": "application/problem+json",
      },
    }
  );
}

export const Responses = {
  notFound,
};
