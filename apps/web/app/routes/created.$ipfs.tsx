import FormCard from "@/components/form/shared/FormCard";
import { airstreamLinkCopiedToast } from "@/utils/toasts";
import { Button } from "@repo/ui/components/ui/button";
import { useToast } from "@repo/ui/hooks/use-toast";
import { useState } from "react";
import { Link, useParams } from "react-router";

function CreatedPage() {
  const ipfsHash = useParams().ipfs;
  const { toast } = useToast();
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  return (
    <div className="max-w-xl mx-auto">
      <div className="px-3 mt-16">
        <FormCard
          title="Congratulations! 🎉"
          description="You've successfully created an Airstream. Share the link with your users so they can claim their rewards!"
        >
          <div className="flex justify-center gap-2">
            <Button
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/claim/${ipfsHash}`,
                );
                airstreamLinkCopiedToast(toast);
                setIsLinkCopied(true);
              }}
            >
              {isLinkCopied ? "Link copied" : "Copy link"}
            </Button>
            <Button variant="outline">
              <Link to={`/claim/${ipfsHash}`}>Visit claim page</Link>
            </Button>
          </div>
        </FormCard>
      </div>
    </div>
  );
}

export default CreatedPage;
