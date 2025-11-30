"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTokenContext } from "@/context/TokenContext";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  Button,
  Spinner,
  Avatar,
  Divider,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Image
} from "@heroui/react";

interface UserData {
  name: string;
  phone: string;
  addr: string;
  username: string;
  cust_id?: number;
  purchases?: Purchase[];
}

interface Purchase {
  car_id: number;
  car_name: string;
  car_price: number;
  car_image: string;
}

export default function ProfilePage() {
  const { token, isAuthenticated, setToken, clearToken } = useTokenContext();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acct_info, setAcct_info] = useState<boolean>(true);
  
  // Modal for editing
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  // Modal for delete confirmation
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure();
  
  // Form data for editing
  const [formData, setFormData] = useState<UserData>({
    name: "",
    phone: "",
    addr: "",
    username: ""
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/signin");
      return;
    }
  }, [isAuthenticated, router]);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch("http://localhost:8000/api/user/me", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            clearToken();
            router.push("/signin");
            return;
          }
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        console.log("Fetched user data:", data);
        setUserData(data.user);
        setFormData(data.user);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load user information");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token, clearToken, router]);

  // Handle form submission
  const handleSave = async () => {
    if (!token) return;
    
    try {
      setSaving(true);
      setError(null);

      const response = await fetch("http://localhost:8000/api/user/me", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update user data");
      }

      const data = await response.json();
      setUserData(data.user);
      
      // Update token if username changed
      if (data.new_token) {
        setToken(data.new_token);
      }
      
      setEditing(false);
      onOpenChange();
    } catch (error: any) {
      console.error("Error updating user data:", error);
      setError(error.message || "Failed to update user information");
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = () => {
    if (userData) {
      setFormData(userData);
      setEditing(true);
      onOpen();
    }
  };

  const handleInputChange = (field: keyof UserData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!token) return;
    
    try {
      setDeleting(true);
      setError(null);

      const response = await fetch("http://localhost:8000/api/user/me", {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to delete account");
      }

      // Account successfully deleted
      clearToken();
      router.push("/");
      
    } catch (error: any) {
      console.error("Error deleting account:", error);
      setError(error.message || "Failed to delete account");
    } finally {
      setDeleting(false);
      onDeleteOpenChange();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" label="Loading profile..." />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardBody className="text-center py-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Profile not found</h1>
            <p className="text-gray-600 mb-4">Unable to load your profile information.</p>
            <Button color="primary" onClick={() => router.push("/")}>
              Go Home
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br  py-8">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold  mb-2">My Profile</h1>
          <p className="">Manage your account information and preferences</p>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardBody>
              <p className="text-red-600">{error}</p>
            </CardBody>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Profile Summary */}
          <div className="lg:col-span-1">
            <Card className="text-center">
              <CardBody className="py-8">
                <Avatar
                  size="xl"
                  name={userData.name}
                  className="mb-4 mx-auto"
                  color="primary"
                />
                <h2 className="text-xl font-bold  mb-1">
                  {userData.name}
                </h2>
                <p className=" mb-2">@{userData.username}</p>
                <Chip color="success" variant="flat" size="sm">
                  Active Member
                </Chip>
              </CardBody>
              <Button onClick={() => {
                setAcct_info(!acct_info)
              }}>
                {acct_info ? "Acct Info" : "purchases"}
              </Button>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            {acct_info ? (
            <Card>
              <CardHeader className="flex justify-between">
                <h3 className="text-xl font-bold">Account Information</h3>
                <Button
                  color="primary"
                  variant="light"
                  onClick={handleEditClick}
                >
                  Edit Profile
                </Button>
              </CardHeader>
              
              <CardBody>
                <div className="space-y-6">
                  
                  <div>
                    <label className="block text-sm font-medium  mb-2">
                      Full Name
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-900">{userData.name}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Username
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-900">@{userData.username}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium  mb-2">
                      Phone Number
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-900">{userData.phone}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium  mb-2">
                      Address
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-900">{userData.addr || "Not provided"}</p>
                    </div>
                  </div>

                </div>
              </CardBody>
              
              <CardFooter className="flex justify-between">
                <div className="flex gap-2 justify-between w-full">
                  <Button
                    color="danger"
                    variant="light"
                    onClick={() => {
                      clearToken();
                      router.push("/");
                    }}
                  >
                    Sign Out
                  </Button>
                  <Button
                    color="danger"
                    variant="bordered"
                    onClick={onDeleteOpen}
                  >
                    Delete Account
                  </Button>
                </div>
                
              </CardFooter>
            </Card>
            ) : (
            <Card>
              <CardHeader>
                <h3 className="text-xl font-bold">Purchase History</h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                    {userData.purchases && userData.purchases.length > 0 ? (
                      userData.purchases.map((purchase, index) => (
                        <Card key={purchase.car_id} className="border border-gray-200">
                          <CardBody>
                            <div className="flex gap-4">
                              <Image
                                src={purchase.car_image}
                                alt={purchase.car_name}
                                className="w-24 h-16 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-900 mb-1">
                                  {purchase.car_name}
                                </h4>
                                <p className="text-gray-600 text-sm mb-2">
                                  Car ID: {purchase.car_id}
                                </p>
                                <div className="flex justify-between items-center">
                                  <p className="text-lg font-bold text-blue-600">
                                    ${purchase.car_price.toLocaleString()}
                                  </p>
                                  <Chip color="success" variant="flat" size="sm">
                                    Purchased
                                  </Chip>
                                </div>
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <div className="mb-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🚗</span>
                          </div>
                          <h4 className="text-lg font-semibold text-gray-800 mb-2">
                            No Purchases Yet
                          </h4>
                          <p className="text-gray-600 mb-4">
                            You haven't purchased any vehicles yet. Browse our collection to find your perfect car!
                          </p>
                          <Button
                            color="primary"
                            onClick={() => router.push('/')}
                          >
                            Browse Cars
                          </Button>
                        </div>
                      </div>
                    )}
                </div>
              </CardBody>
            </Card>
            )}
          </div>
        </div>

        {/* Edit Profile Modal */}
        <Modal 
          isOpen={isOpen} 
          onOpenChange={onOpenChange}
          placement="center"
          size="2xl"
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>
                  Edit Profile Information
                </ModalHeader>
                <ModalBody>
                  <div className="space-y-4">
                    
                    <Input
                      label="Full Name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      variant="bordered"
                      required
                    />

                    <Input
                      label="Username"
                      placeholder="Enter your username"
                      value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      variant="bordered"
                      description="Changing your username will require you to sign in again"
                      required
                    />

                    <Input
                      label="Phone Number"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      variant="bordered"
                      required
                    />

                    <Input
                      label="Address"
                      placeholder="Enter your address"
                      value={formData.addr}
                      onChange={(e) => handleInputChange("addr", e.target.value)}
                      variant="bordered"
                    />

                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="danger"
                    variant="light"
                    onPress={() => {
                      setFormData(userData!);
                      setError(null);
                      onClose();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    color="primary"
                    onPress={handleSave}
                    isLoading={saving}
                    isDisabled={!formData.name || !formData.username || !formData.phone}
                  >
                    Save Changes
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

        {/* Delete Account Confirmation Modal */}
        <Modal 
          isOpen={isDeleteOpen} 
          onOpenChange={onDeleteOpenChange}
          placement="center"
          size="md"
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="text-danger">
                  Delete Account
                </ModalHeader>
                <ModalBody>
                  <div className="text-center py-4">
                    <p className="text-gray-700 mb-4">
                      Are you sure you want to delete your account?
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      This action cannot be undone. All your data will be permanently removed from our servers.
                    </p>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <p className="text-red-700 font-medium">⚠️ Warning</p>
                      <p className="text-red-600 text-sm">
                        You will be immediately signed out and your account will be permanently deleted.
                      </p>
                    </div>
                    {userData && (
                      <p className="text-sm text-gray-600">
                        Account to be deleted: <strong>@{userData.username}</strong>
                      </p>
                    )}
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="default"
                    variant="light"
                    onPress={() => {
                      setError(null);
                      onClose();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    color="danger"
                    onPress={handleDeleteAccount}
                    isLoading={deleting}
                  >
                    {deleting ? "Deleting..." : "Delete Account"}
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

      </div>
    </div>
  );
}