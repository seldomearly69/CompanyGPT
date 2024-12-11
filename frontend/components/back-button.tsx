import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export function BackButton() {
  return (
    <Link href="/home">
      <Button variant="ghost" size="sm" className="w-full justify-start mb-4">
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to Menu
      </Button>
    </Link>
  );
} 