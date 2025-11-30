"use client";
import React from "react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Card, 
  CardHeader, 
  CardBody, 
  CardFooter, 
  Image, 
  Button, 
  Chip, 
  Divider,
  Spinner 
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
  const carId = params.id;
  const [carData, setCarData] = useState<CarData | null>(null);
  const [loading, setLoading] = useState(true);

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
    </div>
  );
}