"use server";

export async function signIn(formData?: FormData) {
 const body = {
  user: formData?.get("login"),
  password: formData?.get("password"),
 };

 const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}auth/login`, {
  method: "post",
  body: JSON.stringify(body),
  headers: {
   "Content-Type": "application/json",
  },
 });

 const responseJson = await response.json();
 // const { response, error } = await Query({
 //   method: "post",
 //   url: "login",
 //   rawUrl: true,
 //   body,
 // });

 return { responseJson };
}
