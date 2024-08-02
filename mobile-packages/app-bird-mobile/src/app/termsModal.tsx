import {Async} from "@baqhub/sdk";
import {useAbortable} from "@baqhub/sdk-react";
import {router, usePathname} from "expo-router";
import {FC, useCallback, useEffect, useRef} from "react";
import {TermsModalContent} from "../components/terms/termsModalContent";
import {TermsAccepted} from "../helpers/termsAccepted";

//
// Hook.
//

export function useTermsModal() {
  const pathname = usePathname();
  const pathnameRef = useRef("");

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useAbortable(async abort => {
    const termsAccepted = await TermsAccepted.find();
    Async.throwIfAborted(abort);

    // if (termsAccepted || pathnameRef.current === "/termsModal") {
    //   return;
    // }

    await Async.delay(1000);
    router.push("/termsModal");
  }, []);
}

//
// Component.
//

const TermsModal: FC = () => {
  const onAcceptPress = useCallback(async () => {
    router.back();
    await TermsAccepted.accept();
  }, []);

  return <TermsModalContent onAcceptPress={onAcceptPress} />;
};

export default TermsModal;
