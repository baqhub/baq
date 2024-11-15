import {useSearchDialogState} from "@baqhub/app-bird-shared/build/src/state/searchDialogState";
import {router} from "expo-router";
import {FC, useCallback, useRef} from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  View,
} from "react-native";
import tiwi from "tiwi";
import {Button} from "../components/core/button";
import {TextBox} from "../components/core/textBox";
import {Column, Row, Text} from "../helpers/style";

//
// Style.
//

const SafeArea = tiwi(SafeAreaView)`
  flex-1
  justify-end
`;

const Overlay = tiwi(Pressable)`
  absolute
  top-0
  right-0
  bottom-0
  left-0

  bg-neutral-900/20
  dark:bg-white/20
`;

const Card = tiwi(Column)`
  py-6
  px-8
  gap-3
`;

const CardBackground = tiwi(View)`
  absolute
  top-0
  right-0
  -bottom-[2000px]
  left-0

  rounded-[36]
  bg-white
  dark:bg-neutral-950
`;

const Title = tiwi(Text)`
  text-lg
  font-semibold
`;

const Form = tiwi(Row)`
  gap-2
`;

//
// Component.
//

const SearchModal: FC = () => {
  const onEntityFound = useCallback((entity: string) => {
    router.back();
    router.navigate({
      pathname: "/(feed)/profile/[entity]" as any,
      params: {entity},
    });
  }, []);

  const state = useSearchDialogState(onEntityFound);
  const {isResolving, entity} = state;
  const {onEntityChange, onResolutionRequest} = state;

  const onRequestClose = () => {
    if (isResolving) {
      return;
    }

    router.back();
  };

  const entityRef = useRef(entity);
  const onInputChange = useCallback((newEntity: string) => {
    entityRef.current = newEntity;
  }, []);

  const onContinue = useCallback(() => {
    if (entityRef.current.length < 3) {
      return;
    }

    onEntityChange(entityRef.current);
    onResolutionRequest();
  }, [onEntityChange, onResolutionRequest]);

  return (
    <SafeArea>
      <Overlay onPress={onRequestClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Card>
          <CardBackground style={{borderCurve: "continuous"}} />
          <Title>Search for a user</Title>
          <Form>
            <TextBox
              autoFocus
              placeholder="user.host.com"
              defaultValue={entityRef.current}
              isDisabled={isResolving}
              enterKeyHint="search"
              onChange={onInputChange}
              onSubmit={onContinue}
            />
            <Button
              variant="primary"
              isDisabled={isResolving}
              onPress={onContinue}
            >
              Search
            </Button>
          </Form>
        </Card>
      </KeyboardAvoidingView>
    </SafeArea>
  );
};

export default SearchModal;
