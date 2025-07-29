import { View, Text } from "react-native";
import ModalBox from "@/components/common/ModalBox";

function EnterModal() {
    return (
        <ModalBox visible={true} title="참여하기" onClose={() => {}}>
            <Text>EnterModal</Text>
        </ModalBox>
    )
}

export default EnterModal;