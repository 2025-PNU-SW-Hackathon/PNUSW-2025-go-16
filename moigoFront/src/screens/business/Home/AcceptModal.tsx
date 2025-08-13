import { Text } from "react-native";
import ModalBox from "@/components/common/ModalBox";

interface AcceptModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AcceptModal({ visible, onClose }: AcceptModalProps) {
  return (
    <ModalBox visible={visible} title="예약 승인" onClose={onClose}>
      <Text>예약 승인</Text>
    </ModalBox>
  );
}