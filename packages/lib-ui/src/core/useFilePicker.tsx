import {HandlerOf} from "@baqhub/sdk";
import {ReactEventHandler, useCallback, useRef, useState} from "react";

//
// Hook.
//

export function useFilePicker(onFile: HandlerOf<File>, accept?: string) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputKey, setInputKey] = useState(0);

  const pickFile = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const onInputChange = useCallback<ReactEventHandler<HTMLInputElement>>(
    e => {
      setInputKey(v => v + 1);

      const {files} = e.currentTarget;
      if (!files) {
        return;
      }

      [...files].forEach(file => {
        if (accept && !file.type.match(accept)) {
          return;
        }

        onFile(file);
      });
    },
    [accept, onFile]
  );

  const filePicker = (
    <input
      ref={inputRef}
      key={`file${inputKey}`}
      type="file"
      accept={accept}
      onChange={onInputChange}
      multiple
      hidden
    />
  );

  return {filePicker, pickFile};
}
