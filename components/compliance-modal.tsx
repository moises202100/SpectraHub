"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ComplianceModal = ({
  isOpen,
  onClose,
}: ComplianceModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background max-w-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            18 U.S.C. 2257 Record-Keeping Requirements Compliance Statement
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4 text-sm leading-relaxed">
          <p>
            Although we are not subject to United States law, we voluntarily comply with the provisions of 18 U.S.C. § 2257 and its regulations.
          </p>
          
          <p>
            All models, actors, actresses and other persons that appear in any visual portrayal of actual or simulated sexually explicit conduct appearing on, or otherwise contained in, this Website were required to be over the age of eighteen (18) years at the time the visual image was produced. Records required for all depictions of actual sexually explicit conduct by Title 18 U.S.C. 2257 and its related regulations are on file with the custodian of records set forth below and will be made available to authorized inspectors.
          </p>
          
          <p>
            All other visual depictions displayed on this Website are exempt from the provision of 18 U.S.C. §§ 2257, 2257A and/or 28 C.F.R. § 75, because:
          </p>
          
          <ol className="list-decimal pl-6 space-y-2">
            <li>they do not portray conduct as specifically listed in 18 U.S.C § 2256 (2)(A) (i) through (iv),</li>
            <li>they do not portray conduct as specifically listed in 18 U.S.C. § 2257A,</li>
            <li>they do not portray conduct listed in 18 U.S.C. § 2256(2)(A)(v) produced after July 27, 2006, or</li>
            <li>are otherwise exempt because the visual depictions were created prior to July 3, 1995.</li>
          </ol>
        </div>
      </DialogContent>
    </Dialog>
  );
};