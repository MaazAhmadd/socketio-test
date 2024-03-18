import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ModeToggle } from "./theme-toggle";
import { TypographyDemo } from "./typography-demo";
import { DrawerDemo } from "./drawer";

const Unauthenticated = () => {
  return (
    <div className="p-6">
      <div className="p-4">
        <Button className="" variant="outline">
          Click me
        </Button>
      </div>
      <div className="p-10">
        <Carousel className="w-full max-w-xs">
          <CarouselContent>
            {Array.from({ length: 5 }).map((_, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <Card>
                    <CardContent className="flex aspect-square items-center justify-center p-6">
                      <span className="text-4xl font-semibold">
                        {index + 1}
                      </span>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
      <div className="p-10">
        <ModeToggle />
      </div>
      <div className="p-10">
        <DrawerDemo />
      </div>
      <div className="p-10">
        <TypographyDemo />
      </div>
    </div>
  );
};

export default Unauthenticated;
