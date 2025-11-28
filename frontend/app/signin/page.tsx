"use client";
import React from "react";
import { Form, Input, Button } from "@heroui/react";

export default function App() {
  const [action, setAction] = React.useState<String|null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);

  return (
    <Form
      className="w-full max-w-xs flex flex-col gap-4"
      onReset={() => setAction("reset")}
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        let data = Object.fromEntries(new FormData(e.currentTarget));
        console.log("Form data:", data);
        await fetch("http://localhost:8000/api/customer/" + data.username + "/" + data.password)
          .then((response) => response.json())
          .then((data) => {
            console.log("Success:", data);
            //saving token to local storage
            if (data.token) {
              localStorage.setItem("token", data.token);
            }
          })
          .catch((error) => {
            console.error("Error:", error);
          });
        setAction(`submit ${JSON.stringify(data)}`);
        setLoading(false);
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
