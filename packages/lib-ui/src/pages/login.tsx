import {HandlerOf} from "@baqhub/sdk";
import {ConnectStatus, UnauthenticatedState} from "@baqhub/sdk-react";
import {FC, FormEvent, PropsWithChildren, useEffect, useState} from "react";
import tiwi from "tiwi";
import {Button, SubmitButton} from "../core/button.js";
import {Column, Text} from "../core/style.js";
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

const Layout = tiwi(Column)`
  flex-1

  px-5
  gap-20
  items-center
  justify-center
`;

const AppInfo = tiwi(Column)`
  items-center
  gap-6
`;

const AppName = tiwi(Text)`
  text-6xl
  font-semibold
`;

const Form = tiwi.form`
  flex
  flex-row
  min-w-0
  gap-2
`;

export const LoginLogo = tiwi.img`
  w-[184px]
  h-[184px]
  select-none
`;

const RegisterBox = tiwi(Column)`
  sm:flex-row

  items-center
  p-5

  border
  border-neutral-200
  dark:border-neutral-700
  rounded-2xl
`;

const RegisterText = tiwi(Text)`
  text-lg
  text-neutral-700
  dark:text-neutral-200
`;

const ArrowIcon = tiwi.div`
  h-5
  w-5

  text-neutral-700
  dark:text-neutral-200
`;

const ArrowIconDown = tiwi(ArrowIcon)`
  sm:hidden

  mt-2
  mb-3
`;

const ArrowIconRight = tiwi(ArrowIcon)`
  hidden
  sm:block

  ml-2
  mr-3
`;

const ButtonStrong = tiwi.strong`
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
          variant="handle"
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
        <ArrowIconDown>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="size-5"
          >
            <path
              fillRule="evenodd"
              d="M10 3a.75.75 0 0 1 .75.75v10.638l3.96-4.158a.75.75 0 1 1 1.08 1.04l-5.25 5.5a.75.75 0 0 1-1.08 0l-5.25-5.5a.75.75 0 1 1 1.08-1.04l3.96 4.158V3.75A.75.75 0 0 1 10 3Z"
              clipRule="evenodd"
            />
          </svg>
        </ArrowIconDown>
        <ArrowIconRight>
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
        </ArrowIconRight>
        <Button size="large" onClick={onRegisterClick}>
          <span>
            Register on <ButtonStrong>BAQ.RUN</ButtonStrong>
          </span>
        </Button>
      </RegisterBox>
    </Layout>
  );
};
