"use client";
import React from "react";
import {
  Form,
  Input,
  Checkbox,
  Button,
} from "@heroui/react";

interface SignupFormData {
  name: string;
  address?: string;
  phone: string;
  username: string;
  email: string;
  password: string;
  terms: boolean;
}

interface SignupFormErrors {
  name?: string;
  phone?: string;
  username?: string;
  email?: string;
  password?: string;
  terms?: string;
}

export default function App() {
  const [password, setPassword] = React.useState<string>("");
  const [submitted, setSubmitted] = React.useState<SignupFormData | null>(null);
  const [errors, setErrors] = React.useState<SignupFormErrors>({});
  const[loading, setLoading] = React.useState<boolean>(false);
  const[signupError, setSignupError] = React.useState<string|null>(null);

  // Real-time password validation
  const getPasswordError = (value: string): string | null => {
    if (value.length < 4) {
      return "Password must be 4 characters or more";
    }
    if ((value.match(/[A-Z]/g) || []).length < 1) {
      return "Password needs at least 1 uppercase letter";
    }
    if ((value.match(/[^a-z]/gi) || []).length < 1) {
      return "Password needs at least 1 symbol";
    }
    return null;
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries()) as unknown as SignupFormData;

    // Custom validation checks
    const newErrors: SignupFormErrors = {};

    // Password validation
    const passwordError = getPasswordError(data.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    // Username validation
    if (data.name === "admin") {
      newErrors.name = "Nice try! Choose a different username";
    }

    // Validate phone number
    if (data.phone && !/^\d{10}$/.test(data.phone)) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    if (data.username && data.username.length < 4) {
      newErrors.username = "Username must be at least 4 characters long";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!data.terms) {
      setErrors({ terms: "Please accept the terms" });
      return;
    }

    // Clear errors and submit
    setErrors({});
    setSubmitted(data);
    const res = await fetch('http://localhost:8000/api/customer/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: data.name,
        phone: data.phone,
        addr: data.address,
        username: data.username,
        password: data.password,
      }),
    });
    
    if (!res.ok) {
      const error = await res.json();
      setSignupError(error.message);
      setLoading(false);
      return;
    }
     const token = await res.json();
      if (token.token) {
        localStorage.setItem("token", token.token);
      }
    setLoading(false);
  };

  return (
    <Form
      className="w-full justify-center items-center space-y-4"
      validationErrors={errors}
      onReset={() => setSubmitted(null)}
      onSubmit={onSubmit}
    >
      <div>
        <span className="tracking-tight inline font-semibold text-[2.3rem] lg:text-5xl">
          MeCar{" "}
        </span>{" "}
        <span className="tracking-tight inline font-semibold from-[#FF1CF7] to-[#b249f8] text-[2.3rem] lg:text-5xl bg-clip-text text-transparent bg-gradient-to-b">
          Sign Up
        </span>
      </div>
      <div className="flex flex-col gap-4 max-w-md">
        {/* Name */}
        <Input
          isRequired
          errorMessage={({ validationDetails }) => {
            if (validationDetails.valueMissing) {
              return "Please enter your name";
            }
            return errors.name;
          }}
          label="Name"
          labelPlacement="outside"
          name="name"
          placeholder="Enter your name"
        />
        {/* Home Address */}
        <Input
          label="Home Address"
          labelPlacement="outside"
          name="address"
          placeholder="Enter your home address"
          type="text"
        />
        {/* Phone Number */}
        <Input
          isRequired
          errorMessage={({ validationDetails }) => {
            if (validationDetails.valueMissing) {
              return "Please enter phone number";
            }
            if (validationDetails.typeMismatch) {
              return "Please enter a valid phone number";
            }
            return errors.phone;
          }}
          label="Phone Number"
          labelPlacement="outside"
          name="phone"
          placeholder="Enter your phone number"
          type="text"
        />
        {/* Username */}
        <Input
          isRequired
          errorMessage={({ validationDetails }) => {
            if (validationDetails.valueMissing) {
              return "Please enter your username";
            }
            if (validationDetails.typeMismatch) {
              return "Please enter a valid username";
            }
            return errors.username;
          }}
          label="Username"
          labelPlacement="outside"
          name="username"
          placeholder="Enter your username"
          type="text"
        />
        {/* Email */}
        <Input
          isRequired
          errorMessage={({ validationDetails }) => {
            if (validationDetails.valueMissing) {
              return "Please enter your email";
            }
            if (validationDetails.typeMismatch) {
              return "Please enter a valid email address";
            }
            return errors.email;
          }}
          label="Email"
          labelPlacement="outside"
          name="email"
          placeholder="Enter your email"
          type="email"
        />
        {/* Password */}
        <Input
          isRequired
          errorMessage={getPasswordError(password)}
          isInvalid={getPasswordError(password) !== null}
          label="Password"
          labelPlacement="outside"
          name="password"
          placeholder="Enter your password"
          type="password"
          value={password}
          onValueChange={setPassword}
        />
        {/* Terms and Conditions */}
        <Checkbox
          isRequired
          classNames={{
            label: "text-small",
          }}
          isInvalid={!!errors.terms}
          name="terms"
          validationBehavior="aria"
          value="true"
          onValueChange={() =>
            setErrors((prev) => ({ ...prev, terms: undefined }))
          }
        >
          I agree to the terms and conditions
        </Checkbox>
        {errors.terms && (
          <span className="text-danger text-small">{errors.terms}</span>
        )}
        <p className="text-small text-danger ">{signupError}</p>
        <div className="flex gap-4">
          <Button className="w-full" color="primary" type="submit">
           {
            loading ? "Submitting..." : "Submit"
           }
          </Button>
          <Button
            variant="bordered"
            onClick={() => {
              window.location.href = "/signin";
            }}
          >
            Sign In
          </Button>
        </div>
      </div>
      {submitted && (
        <div className="text-small text-default-500 mt-4">
          Submitted data: <pre>{JSON.stringify(submitted, null, 2)}</pre>
        </div>
      )}
    </Form>
  );
}
