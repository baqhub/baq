import {
  useFindEntityRecord,
  useRecordHelpers,
} from "@baqhub/app-bird-shared/build/src/baq/store";
import {Handler} from "@baqhub/sdk";
import {FC, useCallback} from "react";
import {SafeAreaView, View} from "react-native";
import {Column, Text, tw} from "../../helpers/style";
import {Avatar} from "../core/avatar";
import {Button} from "../core/button";
import {TermsBackButton} from "./termsBackButton";
import {TermsLink} from "./termsLink";

//
// Props.
//

interface TermsModalContentProps {
  onAcceptPress: Handler;
}

//
// Style.
//

const SafeArea = tw(SafeAreaView)`
  flex-1

  bg-white
  dark:bg-neutral-950
`;

const Layout = tw(Column)`
  flex-1
  p-6
  justify-between
`;

const Profile = tw(Column)`
  items-center
  gap-5
  px-7
  py-6
  self-center

  border
  border-amber-500
  rounded-2xl

  bg-white
  dark:bg-neutral-950
  shadow-md
  shadow-amber-500/50
`;

const WelcomeText = tw(Text)`
  text-center
  text-4xl
  font-semibold
`;

const NameText = tw(Text)`
  truncate
  text-2xl
  font-semibold
`;

const InstructionsText = tw(Text)`
  px-5
  pb-1
  text-center
  text-base
  text-neutral-600
  dark:text-neutral-300
  leading-7
`;

const Links = tw(Column)`
  gap-3
`;

const Buttons = tw(Column)`
  gap-4
`;

//
// Component.
//

export const TermsModalContent: FC<TermsModalContentProps> = props => {
  const {onAcceptPress} = props;
  const {entity, onDisconnectRequest} = useRecordHelpers();
  const entityRecord = useFindEntityRecord(entity);
  const name = entityRecord?.content.profile.name || entity;

  const onBackPress = useCallback(() => {
    onDisconnectRequest();
  }, [onDisconnectRequest]);

  return (
    <SafeArea>
      <Layout>
        <View />
        <WelcomeText>Welcome 👋</WelcomeText>
        <Profile>
          <Avatar size="large" entity={entity} />
          <NameText numberOfLines={1}>{name}</NameText>
        </Profile>
        <Links>
          <InstructionsText>
            To use Bird, you need to accept the following terms and conditions:
          </InstructionsText>
          <TermsLink to="https://bird.baq.dev/privacy">
            Privacy Policy
          </TermsLink>
          <TermsLink to="https://bird.baq.dev/eula">
            End-User License Agreement
          </TermsLink>
        </Links>
        <Buttons>
          <TermsBackButton onPress={onBackPress}>Go back</TermsBackButton>
          <Button variant="primary" onPress={onAcceptPress}>
            Accept and Continue
          </Button>
        </Buttons>
      </Layout>
    </SafeArea>
  );
};
