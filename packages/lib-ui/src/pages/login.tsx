import {HandlerOf} from "@baqhub/sdk";
import {ConnectStatus, UnauthenticatedState} from "@baqhub/sdk-react";
import {FC, FormEvent, PropsWithChildren, useEffect, useState} from "react";
import {Button, SubmitButton} from "../core/button.js";
import {Column, Row, Text, tw} from "../core/style.js";
import {TextBox} from "../core/textBox.js";

//
// Props.
//

interface LoginProps extends PropsWithChildren {
  appName: string;
  state: UnauthenticatedState;
  onConnectClick: HandlerOf<string>;
}

//
// Style.
//

const Layout = tw(Column)`
  flex-1

  gap-20
  items-center
  justify-center
`;

const AppInfo = tw(Column)`
  items-center
  gap-6
`;

const AppName = tw(Text)`
  text-6xl
  font-semibold
`;

const Form = tw.form`
  flex
  flex-row
  min-w-0
  gap-2
`;

export const LoginLogo = tw.img`
  w-[184px]
  h-[184px]
  select-none
`;

const RegisterBox = tw(Row)`
  items-center
  p-5

  border
  border-neutral-200
  dark:border-neutral-700
  rounded-2xl
`;

const RegisterText = tw(Text)`
  text-lg
  text-neutral-700
  dark:text-neutral-200
`;

const ArrowIcon = tw.div`
  ml-2
  mr-3

  h-5
  w-5

  text-neutral-700
  dark:text-neutral-200
`;

const ButtonStrong = tw.strong`
  font-semibold
`;

//
// Component.
//

export const Login: FC<LoginProps> = props => {
  const {appName, state, children, onConnectClick} = props;
  const [entity, setEntity] = useState("");
  const isConnecting = state.connectStatus !== ConnectStatus.IDLE;

  useEffect(() => {
    if (state.connectStatus !== ConnectStatus.WAITING_ON_FLOW) {
      return;
    }

    window.location.href = state.flowUrl;
  }, [state]);

  const onFormSubmit: HandlerOf<FormEvent> = e => {
    e.preventDefault();
    onConnectClick(entity);
  };

  const onRegisterClick = () => {
    window.open("https://baq.run/register", "_blank");
  };

  return (
    <Layout>
      <AppInfo>
        {children}
        <AppName>{appName}</AppName>
      </AppInfo>
      <Form onSubmit={onFormSubmit}>
        <TextBox
          value={entity}
          onChange={setEntity}
          size="large"
          placeholder="user.host.com"
          isDisabled={isConnecting}
        />
        <SubmitButton variant="primary" size="large" isDisabled={isConnecting}>
          Sign in
        </SubmitButton>
      </Form>
      <RegisterBox>
        <RegisterText>No BAQ account?</RegisterText>
        <ArrowIcon>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="size-5"
          >
            <path
              fillRule="evenodd"
              d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
              clipRule="evenodd"
            />
          </svg>
        </ArrowIcon>
        <Button size="large" onClick={onRegisterClick}>
          <span>
            Register on <ButtonStrong>BAQ.RUN</ButtonStrong>
          </span>
        </Button>
      </RegisterBox>
    </Layout>
  );
};
