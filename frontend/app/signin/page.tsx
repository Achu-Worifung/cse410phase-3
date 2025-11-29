"use client";
import React from "react";
import { Form, Input, Button } from "@heroui/react";
import { useTokenContext } from "@/context/TokenContext";
import { useRouter } from "next/navigation";

export default function App() {
  const [action, setAction] = React.useState<String|null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const { setToken } = useTokenContext();
  const router = useRouter();

  return (
    <Form
      className="w-full max-w-xs flex flex-col gap-4"
      onReset={() => setAction("reset")}
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        let data = Object.fromEntries(new FormData(e.currentTarget));
        console.log("Form data:", data);
        try {
          const username = String(data.username);
          const password = String(data.password);
          const response = await fetch("http://localhost:8000/api/customer/" + encodeURIComponent(username) + "/" + encodeURIComponent(password));
          const responseData = await response.json();
          
          console.log("Response:", responseData);
          
          if (responseData.error) {
            setAction("error: " + responseData.message);
            setLoading(false);
            return;
          }
          
          // Save token using context (which also saves to localStorage)
          if (responseData.token) {
            setToken(responseData.token);
            // Redirect to home page after successful login
            router.push("/");
          } else {
            console.error("No token received");
            setAction("error: " + (responseData.message || "No token received"));
          }
        } catch (error: any) {
          console.error("Error:", error);
          setAction("error: " + (error.message || "Network error occurred"));
        } finally {
          setLoading(false);
        }
      }}
    >
      <div>
        <span className="tracking-tight inline font-semibold text-[2.3rem] lg:text-5xl">
          MeCar{" "}
        </span>{" "}
        <span className="tracking-tight inline font-semibold from-[#FF1CF7] to-[#b249f8] text-[2.3rem] lg:text-5xl bg-clip-text text-transparent bg-gradient-to-b">
          Sign in
        </span>
      </div>
      <Input
        isRequired
        errorMessage="Please enter a valid username"
        label="Username"
        labelPlacement="outside"
        name="username"
        placeholder="Enter your username"
        type="text"
      />

      <Input
        isRequired
        errorMessage="Please enter your password"
        label="Password"
        labelPlacement="outside"
        name="password"
        placeholder="Enter your password"
        type="password"
      />
      <div className="flex gap-2">
        <Button color="primary" type="submit" disabled={loading}>
          { loading ? "Submitting..." : "Submit" }
        </Button>
        <Button  variant="flat" disabled={loading} onClick={(e) =>{
          e.preventDefault();
          window.location.href = "/signup";
        }}>
          Sign Up
        </Button>
      </div>
      {action && (
        <div className="text-small text-default-500">
          Action: <code>{action}</code>
        </div>
      )}
    </Form>
  );
}
