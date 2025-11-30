"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTokenContext } from "@/context/TokenContext";
import { 
  Card, 
  CardHeader, 
  CardBody, 
  CardFooter, 
  Image, 
  Button, 
  Chip, 
  Divider,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  useDisclosure
} from "@heroui/react"; 

interface CarData {
  id: number;
  name: string;
  image: string;
  category: string;
  price: number;
  condition: string;
  mileage: string;
  rating: number;
  monthlyPayment: string;
  dealer: string;
  vin: string;
  color: string;
  listPrice: number;
  featured: boolean;
  accentColor: string;
  createdAt: string;
}

export default function CarDetail() {
  const params = useParams();
  const router = useRouter();
  const carId = params.id;
  const [carData, setCarData] = useState<CarData | null>(null);
  const [loading, setLoading] = useState(true);
  const { setToken, isAuthenticated } = useTokenContext();
  
  // Modal states
  const { isOpen: isLoginOpen, onOpen: onLoginOpen, onOpenChange: onLoginOpenChange } = useDisclosure();
  const { isOpen: isPurchaseOpen, onOpen: onPurchaseOpen, onOpenChange: onPurchaseOpenChange } = useDisclosure();
  
  // Purchase form state
  const [purchaseData, setPurchaseData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    paymentMethod: 'financing'
  });
  

  //fetching car details
  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/api/car/${carId}`);
        const data = await response.json();
        console.log(data);
        const mappedData: CarData = {
          id: data[0],
          name: data[1],
          image: data[2],
          category: data[3],
          price: data[4],
          condition: data[5],
          mileage: data[6],
          rating: data[7],
          monthlyPayment: data[8],
          dealer: data[9],
          vin: data[10],
          color: data[11],
          listPrice: data[12],
          featured: data[13],
          accentColor: data[14],
          createdAt: data[17]
        };
        
        setCarData(mappedData);
      } catch (error) {
        console.error("Error fetching car details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCarDetails();
  }, [carId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" label="Loading car details..." />
      </div>
    );
  }

  if (!carData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardBody className="text-center py-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Car not found</h1>
            <p className="text-gray-600">The requested vehicle could not be loaded.</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br  py-8">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Header Card */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{carData.name}</h1>
                  {carData.featured && (
                    <Chip color="warning" variant="flat" size="sm">
                      Featured
                    </Chip>
                  )}
                </div>
                <p className="text-gray-600">{carData.dealer}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">
                  ${carData.price.toLocaleString()}
                </div>
                {carData.listPrice !== carData.price && (
                  <div className="text-sm text-gray-500 line-through">
                    ${carData.listPrice.toLocaleString()}
                  </div>
                )}
                <div className="text-sm text-gray-600">
                  Est. ${carData.monthlyPayment}/mo
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Image and Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Car Image */}
            <Card>
              <CardBody className="p-0">
                <Image
                  src={carData.image}
                  alt={carData.name}
                  className="w-full h-80 object-cover"
                  radius="lg"
                />
              </CardBody>
            </Card>

            {/* Vehicle Information */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-bold">Vehicle Information</h2>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Condition:</span>
                      <Chip 
                        color={carData.condition === 'New' ? 'success' : 'primary'} 
                        variant="flat" 
                        size="sm"
                      >
                        {carData.condition}
                      </Chip>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mileage:</span>
                      <span className="font-medium">{carData.mileage} miles</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium">{carData.category}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rating:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{carData.rating}</span>
                        <span className="text-yellow-500">★</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Color:</span>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full border border-gray-300" 
                          style={{ backgroundColor: carData.accentColor }}
                        ></div>
                        <span className="font-medium">{carData.color}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">VIN:</span>
                      <span className="font-mono text-sm">{carData.vin.slice(-8)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Listed:</span>
                      <span className="font-medium text-sm">
                        {new Date(carData.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                </div>
              </CardBody>
            </Card>

            {/* Pricing Breakdown */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-bold">Pricing Details</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">List Price:</span>
                    <span className={carData.listPrice !== carData.price ? 'line-through text-gray-500' : 'font-bold'}>
                      ${carData.listPrice.toLocaleString()}
                    </span>
                  </div>
                  
                  {carData.listPrice !== carData.price && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Sale Price:</span>
                      <span className="font-bold text-green-600">
                        ${carData.price.toLocaleString()}
                      </span>
                    </div>
                  )}
                  
                  {carData.listPrice !== carData.price && (
                    <>
                      <Divider />
                      <div className="flex justify-between items-center text-green-600">
                        <span className="font-medium">You Save:</span>
                        <span className="font-bold">
                          ${(carData.listPrice - carData.price).toLocaleString()}
                        </span>
                      </div>
                    </>
                  )}
                  
                  <Divider />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Est. Monthly Payment:</span>
                    <span className="font-bold text-blue-600">
                      ${carData.monthlyPayment}/mo
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>

          </div>

          {/* Right Column - Action Panel */}
          <div className="space-y-6">
            
            {/* Purchase Actions */}
            <Card className="">
              <CardHeader>
                <h2 className="text-lg font-bold">Take Action</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  <Button 
                    color="primary" 
                    size="lg" 
                    className="w-full"
                    onClick={() => {
                      if (!isAuthenticated) {
                        onLoginOpen();
                      } else {
                        onPurchaseOpen();
                      }
                    }}
                  >
                    Purchase Now
                  </Button>
                  
                  <Button 
                    variant="bordered" 
                    size="lg" 
                    className="w-full"
                  >
                    Schedule Test Drive
                  </Button>
                  
                  <Button 
                    variant="light" 
                    size="lg" 
                    className="w-full"
                  >
                    Get Financing Quote
                  </Button>
                </div>
              </CardBody>
              
              <CardFooter>
                <div className="w-full text-center text-sm text-gray-600">
                  <p>Need help? Call our sales team</p>
                  <p className="font-medium">(555) 123-4567</p>
                </div>
              </CardFooter>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-bold">Quick Stats</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  <div className="text-center p-3  rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{carData.rating}</div>
                    <div className="text-sm text-gray-600">Customer Rating</div>
                  </div>
                  
                  <div className="text-center p-3 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{carData.condition}</div>
                    <div className="text-sm text-gray-600">Condition</div>
                  </div>
                  
                  <div className="text-center p-3  rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{carData.category}</div>
                    <div className="text-sm text-gray-600">Vehicle Type</div>
                  </div>
                </div>
              </CardBody>
            </Card>

          </div>
        </div>
      </div>
      
      {/* Login Required Modal */}
      <Modal 
        isOpen={isLoginOpen} 
        onOpenChange={onLoginOpenChange}
        placement="center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Login Required
              </ModalHeader>
              <ModalBody>
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4">
                    You need to be logged in to purchase this vehicle.
                  </p>
                  <p className="text-sm text-gray-500">
                    Please sign in to your account or create a new one to continue with your purchase.
                  </p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button 
                  color="danger" 
                  variant="light" 
                  onPress={onClose}
                >
                  Cancel
                </Button>
                <Button 
                  color="primary" 
                  onPress={() => {
                    router.push('/signin');
                    onClose();
                  }}
                >
                  Sign In
                </Button>
                <Button 
                  color="secondary" 
                  variant="bordered"
                  onPress={() => {
                    router.push('/signup');
                    onClose();
                  }}
                >
                  Sign Up
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Purchase Modal */}
      <Modal 
        isOpen={isPurchaseOpen} 
        onOpenChange={onPurchaseOpenChange}
        placement="center"
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Complete Your Purchase
              </ModalHeader>
              <ModalBody>
                {carData && (
                  <div className="space-y-6">
                    {/* Vehicle Summary */}
                    <Card>
                      <CardBody>
                        <div className="flex gap-4">
                          <Image
                            src={carData.image}
                            alt={carData.name}
                            className="w-24 h-16 object-cover"
                            radius="md"
                          />
                          <div className="flex-1">
                            <h3 className="font-bold">{carData.name}</h3>
                            <p className="text-sm text-gray-600">{carData.dealer}</p>
                            <p className="text-lg font-bold text-blue-600">
                              ${carData.price.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    {/* Purchase Form */}
                    <div className="space-y-4">
                      <h4 className="font-semibold">Contact Information</h4>
                      
                      <Input
                        label="Full Name"
                        placeholder="Enter your full name"
                        value={purchaseData.fullName}
                        onChange={(e) => setPurchaseData({...purchaseData, fullName: e.target.value})}
                        required
                      />
                      
                      <Input
                        label="Email"
                        placeholder="Enter your email"
                        type="email"
                        value={purchaseData.email}
                        onChange={(e) => setPurchaseData({...purchaseData, email: e.target.value})}
                        required
                      />
                      
                      <Input
                        label="Phone Number"
                        placeholder="Enter your phone number"
                        type="tel"
                        value={purchaseData.phone}
                        onChange={(e) => setPurchaseData({...purchaseData, phone: e.target.value})}
                        required
                      />
                      
                      <Input
                        label="Address"
                        placeholder="Enter your address"
                        value={purchaseData.address}
                        onChange={(e) => setPurchaseData({...purchaseData, address: e.target.value})}
                        required
                      />
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-4">
                      <h4 className="font-semibold">Payment Method</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Button
                          variant={purchaseData.paymentMethod === 'financing' ? 'solid' : 'bordered'}
                          color={purchaseData.paymentMethod === 'financing' ? 'primary' : 'default'}
                          onClick={() => setPurchaseData({...purchaseData, paymentMethod: 'financing'})}
                          className="h-auto p-4 flex flex-col items-start"
                        >
                          <span className="font-medium">Financing</span>
                          <span className="text-sm text-gray-600">
                            ${carData.monthlyPayment}/mo
                          </span>
                        </Button>
                        
                        <Button
                          variant={purchaseData.paymentMethod === 'cash' ? 'solid' : 'bordered'}
                          color={purchaseData.paymentMethod === 'cash' ? 'primary' : 'default'}
                          onClick={() => setPurchaseData({...purchaseData, paymentMethod: 'cash'})}
                          className="h-auto p-4 flex flex-col items-start"
                        >
                          <span className="font-medium">Cash Payment</span>
                          <span className="text-sm text-gray-600">
                            ${carData.price.toLocaleString()}
                          </span>
                        </Button>
                      </div>
                    </div>

                    {/* Terms */}
                    <div className="text-xs text-gray-500 space-y-2">
                      <p>
                        By clicking "Complete Purchase", you agree to our Terms of Service and Privacy Policy.
                      </p>
                      <p>
                        This purchase is subject to vehicle availability and final credit approval.
                      </p>
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button 
                  color="danger" 
                  variant="light" 
                  onPress={onClose}
                >
                  Cancel
                </Button>
                <Button 
                  color="primary"
                  onPress={() => {
                    // Handle purchase logic here
                    console.log('Purchase data:', purchaseData);
                    alert('Purchase request submitted! Our team will contact you shortly.');
                    onClose();
                  }}
                  isDisabled={!purchaseData.fullName || !purchaseData.email || !purchaseData.phone || !purchaseData.address}
                >
                  Complete Purchase
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}