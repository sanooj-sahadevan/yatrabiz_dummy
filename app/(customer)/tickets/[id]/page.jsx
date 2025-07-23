import SuspenseWrapper from "@/components/ui/SuspenseWrapper";
import TicketDetailsContent from "../../../../components/clientList/TicketDetailsContent";

export default function Page() {
  return (
    <SuspenseWrapper>
      <TicketDetailsContent />
    </SuspenseWrapper>
  );
}
