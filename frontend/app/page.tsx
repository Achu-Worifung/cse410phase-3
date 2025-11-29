"use client";
import React from "react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardFooter, Image, Button, Input } from "@heroui/react";
import carSillouette from "@/public/car-silhouette.png";
import { useInputContext } from "@/context/InputContext";

type carListing = [number, string, string, number, number]; // [CAR_ID, CAR_NAME, IMAGE, PRICE, MILEAGE]

interface FilterState {
  make: string;
  model: string;
  year: string;
  minPrice: string;
  maxPrice: string;
  minMileage: string;
  maxMileage: string;
}

export default function Home() {
  const [carListings, setCarListings] = useState<carListing[]>([]);
  const [offset, setOffSet] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { inputValue } = useInputContext();
  const [filters, setFilters] = useState<FilterState>({
    make: "",
    model: "",
    year: "",
    minPrice: "",
    maxPrice: "",
    minMileage: "",
    maxMileage: "",
  });
  const [showFilters, setShowFilters] = useState(true);

  // Build query parameters from filters
  const buildQueryParams = useCallback((baseOffset: number = 0) => {
    const params = new URLSearchParams({
      offset: baseOffset.toString(),
      limit: "30",
    });

    if (inputValue) {
      params.append("query", inputValue);
    }

    if (filters.make) params.append("make", filters.make);
    if (filters.model) params.append("model", filters.model);
    if (filters.year) params.append("year", filters.year);
    if (filters.minPrice) params.append("min_price", filters.minPrice);
    if (filters.maxPrice) params.append("max_price", filters.maxPrice);
    if (filters.minMileage) params.append("min_mileage", filters.minMileage);
    if (filters.maxMileage) params.append("max_mileage", filters.maxMileage);

    return params.toString();
  }, [inputValue, filters]);

  // filter by search input and filters
  useEffect(() => {
    const fetchCarListings = async () => {
      try {
        const queryString = buildQueryParams(0);
        const response = await fetch(
          `http://localhost:8000/api/cars?${queryString}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        setCarListings(data);
        setOffSet(data.length);
      } catch (error) {
        console.error("Error fetching car listings:", error);
        setCarListings([]);
        setOffSet(0);
      }
    };
    fetchCarListings();
  }, [buildQueryParams]);

  // Remove the duplicate useEffect - now handled above with filters

  const loadMore = async () => {
    setLoading(true);
    try {
      const queryString = buildQueryParams(offset);
      const response = await fetch(
        `http://localhost:8000/api/cars?${queryString}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setCarListings([...carListings, ...data]);
      setOffSet(offset + data.length);
    } catch (error) {
      console.error("Error fetching more car listings:", error);
    }
    setLoading(false);
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      make: "",
      model: "",
      year: "",
      minPrice: "",
      maxPrice: "",
      minMileage: "",
      maxMileage: "",
    });
  };

  return (
    <div className="flex flex-row w-full min-h-screen relative">
      {/* Sidebar */}
      <aside className={`${
        showFilters 
          ? 'w-80 translate-x-0' 
          : '-translate-x-full lg:translate-x-0 lg:w-0 lg:border-r-0'
      } fixed lg:sticky top-0 left-0 h-screen z-40 transition-all duration-300 ease-in-out overflow-hidden border-r border-default-200 bg-content2 flex-shrink-0`}>
        <div className="p-6 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Filters</h2>
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              ✕
            </Button>
          </div>
          
          <div className="flex flex-col gap-4">
            <Input
              label="Make"
              placeholder="e.g., Toyota"
              value={filters.make}
              onChange={(e) => handleFilterChange("make", e.target.value)}
              variant="bordered"
              size="sm"
            />
            <Input
              label="Model"
              placeholder="e.g., Camry"
              value={filters.model}
              onChange={(e) => handleFilterChange("model", e.target.value)}
              variant="bordered"
              size="sm"
            />
            <Input
              label="Year"
              type="number"
              placeholder="e.g., 2020"
              value={filters.year}
              onChange={(e) => handleFilterChange("year", e.target.value)}
              variant="bordered"
              size="sm"
            />
            <Input
              label="Min Price"
              type="number"
              placeholder="e.g., 10000"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange("minPrice", e.target.value)}
              variant="bordered"
              size="sm"
            />
            <Input
              label="Max Price"
              type="number"
              placeholder="e.g., 50000"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
              variant="bordered"
              size="sm"
            />
            <Input
              label="Min Mileage"
              type="number"
              placeholder="e.g., 0"
              value={filters.minMileage}
              onChange={(e) => handleFilterChange("minMileage", e.target.value)}
              variant="bordered"
              size="sm"
            />
            <Input
              label="Max Mileage"
              type="number"
              placeholder="e.g., 100000"
              value={filters.maxMileage}
              onChange={(e) => handleFilterChange("maxMileage", e.target.value)}
              variant="bordered"
              size="sm"
            />
          </div>
          
          <div className="mt-6">
            <Button
              onClick={resetFilters}
              variant="bordered"
              color="default"
              className="w-full"
              size="sm"
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {showFilters && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setShowFilters(false)}
        />
      )}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col items-center my-4 transition-all duration-300 ${
        showFilters ? 'lg:ml-0' : 'lg:ml-0'
      }`}>
        <div className="w-full flex items-center justify-between mb-4 px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="light"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
              isIconOnly
            >
              ☰
            </Button>
            <h1 className="text-3xl font-bold">Car Listings {inputValue}</h1>
          </div>
          <Button
            variant="bordered"
            onClick={() => setShowFilters(!showFilters)}
            className="hidden lg:flex"
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>
       
        <section className="flex flex-row flex-wrap items-center justify-center gap-4 py-8 md:py-10 w-full px-4">
        {carListings.map((carListing: carListing, index) => (
          <Card
            isFooterBlurred
            className="border-none bg-white cursor-pointer"
            radius="lg"
            key={index}
            onClick={() => {
              router.push(`/car/${carListing[0]}`);
            }}
          >
            <Image
              alt={carListing[1]}
              className="object-cover"
              height={200}
              src={carSillouette.src}
              width={300}
            />
            <CardFooter className="justify-between before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
              <p className="text-tiny text-black/80 font-bold">
                {carListing[1]}
              </p>
              <Button
                className="text-tiny text-black bg-black/20"
                color="default"
                radius="lg"
                size="sm"
                variant="flat"
              >
                $ {carListing[3]}
              </Button>
            </CardFooter>
          </Card>
        ))}
        </section>
        <button
          onClick={loadMore}
          disabled={loading}
          className="mb-8 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 cursor-pointer max-w-80"
        >
          {loading ? "Loading..." : "Load More"}
        </button>
      </div>
    </div>
  );
}
