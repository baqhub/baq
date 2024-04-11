import {HandlerOf} from "@baqhub/sdk";
import {ConnectStatus, UnauthenticatedState} from "@baqhub/sdk-react";
import {FC, FormEvent, PropsWithChildren, useEffect, useState} from "react";
import {SubmitButton} from "../core/button.js";
import {Column, Text, tw} from "../core/style.js";
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
    </Layout>
  );
};
