"use client";
import React from "react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardFooter, Image, Button, Input, Select, SelectItem } from "@heroui/react";
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
  sort: string;
}

export default function Home() {
  const [allCars, setAllCars] = useState<carListing[]>([]);
  const [carListings, setCarListings] = useState<carListing[]>([]);
  const [offset, setOffSet] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
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
    sort: "",
  });
  const [showFilters, setShowFilters] = useState(true);
  const [makeOptions, setMakeOptions] = useState<string[]>([]);
  const [modelOptions, setModelOptions] = useState<string[]>([]);
  const [yearOptions, setYearOptions] = useState<string[]>([]);

  // Extract make and model options from car data
  const extractOptions = useCallback((cars: carListing[]) => {
    const makes = new Set<string>();
    const models = new Set<string>();
    const years = new Set<string>();

    cars.forEach((car) => {
      const carName = car[1]; // CAR_NAME
      // Try to extract make and model from car name
      // Assuming format like "Toyota Camry 2020" or "Honda Accord LX"
      const parts = carName.split(' ');
      if (parts.length >= 2) {
        makes.add(parts[0]);
        // For model, take the second part (or combination of parts)
        if (parts.length >= 2) {
          models.add(parts[1]);
        }
        // Try to extract year (look for 4-digit number)
        const yearMatch = carName.match(/(19|20)\d{2}/);
        if (yearMatch) {
          years.add(yearMatch[0]);
        }
      }
    });

    setMakeOptions(Array.from(makes).sort());
    setModelOptions(Array.from(models).sort());
    setYearOptions(Array.from(years).sort().reverse()); // Newest first
  }, []);

  // Client-side filtering function
  const filterCars = useCallback(() => {
    let filtered = [...allCars];

    // Filter by search input
    if (inputValue) {
      const searchTerm = inputValue.toLowerCase();
      filtered = filtered.filter((car) =>
        car[1].toLowerCase().includes(searchTerm)
      );
    }

    // Apply filters
    if (filters.make) {
      filtered = filtered.filter((car) =>
        car[1].toLowerCase().includes(filters.make.toLowerCase())
      );
    }
    if (filters.model) {
      filtered = filtered.filter((car) =>
        car[1].toLowerCase().includes(filters.model.toLowerCase())
      );
    }
    if (filters.year) {
      // Extract year from car name (assuming it's in the name)
      filtered = filtered.filter((car) =>
        car[1].includes(filters.year)
      );
    }
    if (filters.minPrice) {
      filtered = filtered.filter((car) => car[3] >= parseInt(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter((car) => car[3] <= parseInt(filters.maxPrice));
    }
    if (filters.minMileage) {
      filtered = filtered.filter((car) => car[4] >= parseInt(filters.minMileage));
    }
    if (filters.maxMileage) {
      filtered = filtered.filter((car) => car[4] <= parseInt(filters.maxMileage));
    }

    // Apply sorting
    if (filters.sort) {
      switch (filters.sort) {
        case "price_asc":
          filtered.sort((a, b) => a[3] - b[3]);
          break;
        case "price_desc":
          filtered.sort((a, b) => b[3] - a[3]);
          break;
        case "mileage_asc":
          filtered.sort((a, b) => a[4] - b[4]);
          break;
        case "mileage_desc":
          filtered.sort((a, b) => b[4] - a[4]);
          break;
        case "year_asc":
          filtered.sort((a, b) => {
            const yearA = a[1].match(/(19|20)\d{2}/)?.[0] || "0";
            const yearB = b[1].match(/(19|20)\d{2}/)?.[0] || "0";
            return parseInt(yearA) - parseInt(yearB);
          });
          break;
        case "year_desc":
          filtered.sort((a, b) => {
            const yearA = a[1].match(/(19|20)\d{2}/)?.[0] || "0";
            const yearB = b[1].match(/(19|20)\d{2}/)?.[0] || "0";
            return parseInt(yearB) - parseInt(yearA);
          });
          break;
      }
    }

    setCarListings(filtered);
  }, [allCars, inputValue, filters]);

  // Initial data fetch - load all available cars
  useEffect(() => {
    const fetchAllCars = async () => {
      try {
        setInitialLoading(true);
        // Fetch a large number of cars initially
        const response = await fetch(
          `http://localhost:8000/api/cars?limit=500&offset=0`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        setAllCars(data);
        setCarListings(data);
        setOffSet(data.length);
        // Extract make and model options
        extractOptions(data);
      } catch (error) {
        console.error("Error fetching car listings:", error);
        setAllCars([]);
        setCarListings([]);
        setOffSet(0);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchAllCars();
  }, []);

  // Apply filters whenever they change
  useEffect(() => {
    filterCars();
  }, [filterCars]);

  // Remove the duplicate useEffect - now handled above with filters

  const loadMore = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/api/cars?limit=100&offset=${offset}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      const newAllCars = [...allCars, ...data];
      setAllCars(newAllCars);
      setOffSet(offset + data.length);
      // Update make and model options with new cars
      extractOptions(newAllCars);
      // Re-apply filters to include new cars
      filterCars();
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
      sort: "",
    });
  };

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen relative">
      {/* Sidebar */}
      <aside className={`${
        showFilters 
          ? 'w-80 translate-x-0' 
          : '-translate-x-full lg:translate-x-0 lg:w-0 lg:border-r-0'
      } fixed lg:sticky top-16 lg:top-16 left-0  z-10 transition-all duration-300 ease-in-out overflow-hidden border-r border-default-200 bg-content2 flex-shrink-0`}>
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
            <Select
              label="Make"
              placeholder="Select make"
              selectedKeys={filters.make ? [filters.make] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                handleFilterChange("make", selected || "");
              }}
              variant="bordered"
              size="sm"
            >
              {makeOptions.map((make) => (
                <SelectItem key={make} value={make}>
                  {make}
                </SelectItem>
              ))}
            </Select>
            <Select
              label="Model"
              placeholder="Select model"
              selectedKeys={filters.model ? [filters.model] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                handleFilterChange("model", selected || "");
              }}
              variant="bordered"
              size="sm"
            >
              {modelOptions.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </Select>
            <Select
              label="Year"
              placeholder="Select year"
              selectedKeys={filters.year ? [filters.year] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                handleFilterChange("year", selected || "");
              }}
              variant="bordered"
              size="sm"
            >
              {yearOptions.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </Select>
            <Input
              label="Min Price"
              type="number"
              placeholder="e.g., 10000"
              min="0"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange("minPrice", e.target.value)}
              variant="bordered"
              size="sm"
            />
            <Input
              label="Max Price"
              type="number"
              placeholder="e.g., 50000"
              min={filters.minPrice || 0}
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
              variant="bordered"
              size="sm"
            />
            <Input
              label="Min Mileage"
              type="number"
              placeholder="e.g., 0"
              min="0"
              value={filters.minMileage}
              onChange={(e) => handleFilterChange("minMileage", e.target.value)}
              variant="bordered"
              size="sm"
            />
            <Input
              label="Max Mileage"
              type="number"
              min={filters.minMileage || 0}
              placeholder="e.g., 100000"
              value={filters.maxMileage}
              onChange={(e) => handleFilterChange("maxMileage", e.target.value)}
              variant="bordered"
              size="sm"
            />
            <Select
              label="Sort by"
              placeholder="Select sorting option"
              selectedKeys={filters.sort ? [filters.sort] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                handleFilterChange("sort", selected || "");
              }}
              variant="bordered"
              size="sm"
            >
              <SelectItem key="price_asc" value="price_asc">Price: Low to High</SelectItem>
              <SelectItem key="price_desc" value="price_desc">Price: High to Low</SelectItem>
              <SelectItem key="year_asc" value="year_asc">Year: Oldest First</SelectItem>
              <SelectItem key="year_desc" value="year_desc">Year: Newest First</SelectItem>
              <SelectItem key="mileage_asc" value="mileage_asc">Mileage: Low to High</SelectItem>
              <SelectItem key="mileage_desc" value="mileage_desc">Mileage: High to Low</SelectItem>
            </Select>
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
          className="fixed inset-0 bg-black/50 z-[5] lg:hidden top-16"
          onClick={() => setShowFilters(false)}
        />
      )}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col items-center my-4 transition-all duration-300 w-full ${
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
            <div>
              <h1 className="text-3xl font-bold">Car Listings {inputValue}</h1>
              {!initialLoading && (
                <p className="text-sm text-gray-500 mt-1">
                  {carListings.length} of {allCars.length} car{allCars.length !== 1 ? 's' : ''}
                  {(inputValue || Object.values(filters).some(v => v)) ? ' matching filters' : ''}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="bordered"
            onClick={() => setShowFilters(!showFilters)}
            className="hidden lg:flex"
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>
       
        <section className="flex flex-col lg:flex-row lg:flex-wrap items-center justify-center gap-4 py-8 md:py-10 w-full px-4">
        {initialLoading ? (
          <div className="flex items-center justify-center w-full h-64">
            <div className="text-lg">Loading cars...</div>
          </div>
        ) : carListings.length === 0 ? (
          <div className="flex items-center justify-center w-full h-64">
            <div className="text-lg text-gray-500">No cars found matching your criteria.</div>
          </div>
        ) : (
          carListings.map((carListing: carListing, index) => (
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
                onClick={() => {
                  console.log("Navigating to car:", carListing[0]);
                  router.push(`/car/${carListing[0]}`);
                }}
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
          ))
        )}
        </section>
        {!initialLoading && carListings.length > 0 && (
          <button
            onClick={loadMore}
            disabled={loading}
            className="mb-8 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 cursor-pointer max-w-80"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        )}
      </div>
    </div>
  );
}
