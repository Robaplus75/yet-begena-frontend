import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

interface Course {
  id: string;
  title: string;
  description: string;
  youtube_video_id?: string;
}

interface VideoDialogProps {
  course: Course;
}

const VideoDialog = ({ course }: VideoDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Learn</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{course.title}</DialogTitle>
        </DialogHeader>

        {course.youtube_video_id ? (
          <div className="space-y-4">
            <div className="aspect-video w-full">
              <iframe
                src={`https://www.youtube.com/embed/${course.youtube_video_id}`}
                title={course.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded-md"
              ></iframe>
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Course Description</h2>
              <p className="text-sm text-muted-foreground">
                {course.description}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center">
            This course doesn't have a video yet.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VideoDialog;




// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { useToast } from "@/hooks/use-toast";
// import { supabase } from "@/integrations/supabase/client";
// import { UserProfile } from "@/pages/Index";

// interface Course {
//   id: string;
//   title: string;
//   price: number;
// }

// interface PaymentDialogProps {
//   course: Course;
//   user: UserProfile;
// }

// const PaymentDialog = ({ course, user }: PaymentDialogProps) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [paymentStep, setPaymentStep] = useState<"instructions" | "receipt">("instructions");
//   const [receiptFile, setReceiptFile] = useState<File | null>(null);
//   const [isUploading, setIsUploading] = useState(false);
//   const { toast } = useToast();

//   const handleSubmitReceipt = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!receiptFile) {
//       toast({
//         title: "Receipt required",
//         description: "Please upload your payment receipt.",
//         variant: "destructive",
//       });
//       return;
//     }

//     setIsUploading(true);

//     try {
//       // Upload receipt to Supabase Storage
//       const fileExt = receiptFile.name.split('.').pop();
//       const fileName = `${user.id}-${course.id}-${Date.now()}.${fileExt}`;
      
//       const { data: uploadData, error: uploadError } = await supabase.storage
//         .from('payment-receipts')
//         .upload(fileName, receiptFile);

//       if (uploadError) throw uploadError;

//       // Create purchase record
//       const { error: purchaseError } = await supabase
//         .from('purchases')
//         .insert({
//           user_id: user.id,
//           course_id: course.id,
//           amount: course.price,
//           receipt_url: uploadData.path,
//         });

//       if (purchaseError) throw purchaseError;

//       toast({
//         title: "Payment submitted for verification",
//         description: "Your payment receipt has been submitted. You'll receive access once verified.",
//       });
      
//       setIsOpen(false);
//       setPaymentStep("instructions");
//       setReceiptFile(null);
//     } catch (error) {
//       console.error('Error submitting payment:', error);
//       toast({
//         title: "Error",
//         description: "Failed to submit payment receipt. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={setIsOpen}>
//       <DialogTrigger asChild>
//         <Button className="w-full">Enroll Now</Button>
//       </DialogTrigger>
//       <DialogContent className="max-w-md">
//         <DialogHeader>
//           <DialogTitle>Enroll in {course.title}</DialogTitle>
//           <DialogDescription>
//             Complete payment to access this course
//           </DialogDescription>
//         </DialogHeader>

//         {paymentStep === "instructions" && (
//           <div className="space-y-4">
//             <div className="p-4 bg-primary/10 rounded-lg">
//               <h4 className="font-semibold text-primary mb-2">Payment Instructions</h4>
//               <div className="space-y-2 text-sm">
//                 <p><strong>Amount:</strong> {course.price} ETB</p>
//                 <p><strong>Send to:</strong> +251 91 123 4567 (Telebirr)</p>
//                 {/*<p><strong>Reference:</strong> COURSE-{course.id.slice(0, 8)}</p>*/}
//                 <p><strong>Reference:</strong> COURSE-{String(course.id).slice(0, 8)}</p>

//               </div>
//             </div>
            
//             <div className="space-y-3">
//               <p className="text-sm text-muted-foreground">
//                 1. Send the exact amount to the Telebirr number above
//               </p>
//               <p className="text-sm text-muted-foreground">
//                 2. Take a screenshot of your payment confirmation
//               </p>
//               <p className="text-sm text-muted-foreground">
//                 3. Upload the screenshot below for verification
//               </p>
//             </div>

//             <Button 
//               onClick={() => setPaymentStep("receipt")} 
//               className="w-full"
//             >
//               I've Made the Payment
//             </Button>
//           </div>
//         )}

//         {paymentStep === "receipt" && (
//           <form onSubmit={handleSubmitReceipt} className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="receipt">Payment Receipt Screenshot</Label>
//               <Input
//                 id="receipt"
//                 type="file"
//                 accept="image/*"
//                 onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
//                 required
//               />
//               <p className="text-xs text-muted-foreground">
//                 Upload a clear screenshot of your Telebirr payment confirmation
//               </p>
//             </div>

//             <div className="flex space-x-2">
//               <Button 
//                 type="button" 
//                 variant="outline" 
//                 onClick={() => setPaymentStep("instructions")}
//                 className="flex-1"
//                 disabled={isUploading}
//               >
//                 Back
//               </Button>
//               <Button type="submit" className="flex-1" disabled={isUploading}>
//                 {isUploading ? "Submitting..." : "Submit Receipt"}
//               </Button>
//             </div>
//           </form>
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default PaymentDialog;
