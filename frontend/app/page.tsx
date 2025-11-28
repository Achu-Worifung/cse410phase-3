"use client";
import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; 
import { Card, CardFooter, Image, Button } from "@heroui/react";
import carSillouette from "@/public/car-silhouette.png";
import { useInputContext } from "@/context/InputContext";


interface carListing {}

export default function Home() {
  const [carListings, setCarListings] = useState([]);
  const [offset, setOffSet] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter(); 
  const {inputValue} = useInputContext();

  useEffect(() => {
    const fetchCarListings = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/cars?offset=${offset}&limit=30`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        setCarListings(data);
        setOffSet(offset + data.length);
      } catch (error) {
        console.error("Error fetching car listings:", error);
      }
    };

    fetchCarListings();
  }, []);

  const loadMore = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/api/cars?offset=${offset}&limit=30`,
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

  return (
    <div className="flex flex-col my-4 justify-center items-center">
      <h1 className="text-3xl font-bold mb-4">Car Listings {inputValue}</h1>
      <section className="flex flex-row flex-wrap items-center justify-center gap-4 py-8 md:py-10">
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
  );
}
