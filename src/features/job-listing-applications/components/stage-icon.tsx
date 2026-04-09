import { ApplicationStage } from "@/db/schema";
import {
  CircleCheckIcon,
  CircleHelpIcon,
  CircleXIcon,
  HandshakeIcon,
  LucideIcon,
  SpeechIcon,
} from "lucide-react";
import { ComponentPropsWithRef } from "react";

export const StageIcon = ({
  stage,
  ...props
}: { stage: ApplicationStage } & ComponentPropsWithRef<LucideIcon>) => {
  const Icon = getIcon(stage);
  return <Icon {...props} />;
};

const getIcon = (stage: ApplicationStage) => {
  switch (stage) {
    case "applied":
      return CircleHelpIcon;
    case "interested":
      return CircleCheckIcon;
    case "denied":
      return CircleXIcon;
    case "interviewed":
      return SpeechIcon;
    case "hired":
      return HandshakeIcon;
    default:
      throw new Error(`Invalid application stage: ${stage satisfies never}`);
  }
};
