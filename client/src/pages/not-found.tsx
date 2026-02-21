import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] w-full flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6 text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <div>
            <h1 className="text-2xl font-bold">404</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Page not found
            </p>
          </div>
          <Link href="/">
            <Button variant="outline" data-testid="button-go-home">
              <ArrowLeft className="h-4 w-4" />
              <span className="ms-1.5">Go Home</span>
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
