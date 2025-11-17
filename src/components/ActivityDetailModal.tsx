
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

interface Activity {
  slug: string;
  title: string;
  description: string;
  imageName: string;
  content: React.ReactNode;
}

interface ActivityDetailModalProps {
  activity: Activity | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ActivityDetailModal = ({ activity, isOpen, onClose }: ActivityDetailModalProps) => {
  if (!activity) {
    return null;
  }

  const imageUrl = `/${activity.imageName}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0">
        <div className="flex flex-col md:flex-row">
          <div className="relative h-64 md:h-auto md:w-1/2">
            <Image
              src={imageUrl}
              alt={activity.title}
              fill
              className="object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
            />
          </div>
          <div className="flex-1 p-8">
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold mb-4">{activity.title}</DialogTitle>
            </DialogHeader>
            <div className="prose prose-lg dark:prose-invert max-w-none">
                {activity.content}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
