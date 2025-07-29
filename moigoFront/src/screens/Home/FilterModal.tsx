import { View, Text } from "react-native";
import ModalBox from "@/components/common/ModalBox";

function FilterModal() {
    return (
        <ModalBox visible={true} title="필터" onClose={() => {}}>
            <Text>FilterModal</Text>
        </ModalBox>
    )
}

export default FilterModal;