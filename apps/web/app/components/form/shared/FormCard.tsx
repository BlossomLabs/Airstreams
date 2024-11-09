import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";

function FormCard({
  children,
  title,
  description,
}: { children: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="border drop-shadow-[4px_4px_0_#000] rounded-lg mb-6 p-6">
      <CardHeader className="mb-4">
        <CardTitle className="font-header text-xl font-semibold mb-2 text-center">
          {title}
        </CardTitle>
        <CardDescription className="text-gray-600 text-center">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default FormCard;
