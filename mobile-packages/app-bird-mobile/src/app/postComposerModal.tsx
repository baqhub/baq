import {usePostComposerState} from "@baqhub/app-bird-shared/build/src/state/postComposerState";
import {Stack, router} from "expo-router";
import isEmpty from "lodash/isEmpty";
import {FC, useCallback, useRef, useState} from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Button as ReactButton,
  SafeAreaView,
  ScrollView,
  TextInput,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import {amber, neutral, white} from "tailwindcss/colors";
import {Avatar} from "../components/core/avatar";
import {Button} from "../components/core/button";
import {Column, Row, Text, tw} from "../helpers/style";

//
// Style.
//

const SafeArea = tw(SafeAreaView)`
  border-t
  border-neutral-100
  dark:border-neutral-900

  flex-1
  bg-white
  dark:bg-neutral-950
`;

const ComposerScroll = tw(ScrollView)`
  flex-1
`;

const Composer = tw(Row)`
  min-h-full
  p-5
  gap-3
`;

const Content = tw(Column)`
  flex-1
  items-stretch
`;

const InfoRow = tw(Row)`
  gap-1
  items-baseline
  overflow-hidden
`;

const AuthorName = tw(Text)`
  shrink
  text-[16px]
  font-semibold
  text-neutral-800
  dark:text-neutral-100
  group-active:text-neutral-600
  group-active:dark:text-neutral-300
`;

const AuthorEntity = tw(Text)`
  shrink-[2]
  text-neutral-500
  dark:text-neutral-500
`;

const BodyInput = tw(TextInput)`
  flex-1
  text-[16px]
  leading-5
  text-neutral-800
  dark:text-white
`;

const ActionsRow = tw(Row)`
  p-5
  justify-end
`;

//
// Component.
//

const PostComposerModal: FC = () => {
  const [viewHeight, setViewHeight] = useState(0);
  const dimensions = useWindowDimensions();

  const colorScheme = useColorScheme();
  const isLight = colorScheme === "light";

  const state = usePostComposerState();
  const {placeholder, entity, name, text} = state;
  const {onPostPress} = state;

  const textRef = useRef(text);
  const [isTextEmpty, setIsTextEmpty] = useState(isEmpty(text));

  const onInputChange = useCallback((newText: string) => {
    textRef.current = newText;
    setIsTextEmpty(isEmpty(newText));
  }, []);

  const onCancelClick = useCallback(() => {
    if (isEmpty(textRef.current)) {
      router.back();
      return;
    }

    Alert.alert("Discard post?", undefined, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Discard",
        style: "destructive",
        onPress: () => router.back(),
      },
    ]);
  }, []);

  const onPostButtonPress = useCallback(() => {
    onPostPress(textRef.current);
    router.back();
  }, [onPostPress]);

  return (
    <SafeArea
      onLayout={event => {
        const {height} = event.nativeEvent.layout;
        setViewHeight(height);
      }}
    >
      <Stack.Screen
        options={{
          title: "New post",
          headerStyle: {
            backgroundColor: isLight ? white : neutral[950],
          },
          headerShadowVisible: false,
          headerLeft: () => (
            <ReactButton
              title="Cancel"
              color={isLight ? neutral[600] : neutral[400]}
              onPress={onCancelClick}
            />
          ),
          gestureEnabled: isTextEmpty,
        }}
      />
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={dimensions.height - viewHeight}
      >
        <ComposerScroll
          alwaysBounceVertical={false}
          keyboardShouldPersistTaps="always"
        >
          <Composer>
            <Avatar entity={entity} />
            <Content>
              <InfoRow>
                <AuthorName numberOfLines={1}>{name}</AuthorName>
                <AuthorEntity numberOfLines={1}>{entity}</AuthorEntity>
              </InfoRow>
              <BodyInput
                multiline
                autoFocus
                maxLength={480}
                scrollEnabled={false}
                placeholder={placeholder}
                selectionColor={amber[500]}
                onChangeText={onInputChange}
              />
            </Content>
          </Composer>
        </ComposerScroll>
        <ActionsRow>
          <Button
            variant="primary"
            isDisabled={isTextEmpty}
            onPress={onPostButtonPress}
          >
            Publish
          </Button>
        </ActionsRow>
      </KeyboardAvoidingView>
    </SafeArea>
  );
};

export default PostComposerModal;
